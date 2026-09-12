(* Fetch clj-kondo merged-PR review corpus from the GitHub API.
   Uses curl as subprocess (no HTTP lib in this switch); yojson for parsing.
   Outputs: merged_prs.json, review_comments.json, pr_conversations.json *)

let dir =
  match Sys.getenv_opt "CORPUS_DIR" with
  | Some d -> d
  | None -> "/Users/birrame.sene/.cache/clj-kondo-style-guide"

let sh_quote s = "'" ^ String.concat "'\\''" (String.split_on_char '\'' s) ^ "'"

let run_cmd ?(stdin = "") cmd args =
  let ic, oc, ec = Unix.open_process_full
      (String.concat "" (List.map (fun a -> sh_quote a ^ " ") (cmd :: args)))
      (Unix.environment ()) in
  (if stdin <> "" then output_string oc stdin);
  close_out oc;
  let buf = Buffer.create 1_000_000 in
  (try
     while true do Buffer.add_channel buf ic 65536 done
   with End_of_file -> ());
  let err = Buffer.create 1024 in
  (try
     while true do Buffer.add_channel err ec 4096 done
   with End_of_file -> ());
  let status = Unix.close_process_full (ic, oc, ec) in
  (Buffer.contents buf, Buffer.contents err, status)

let token () =
  let out, _, st = run_cmd "gh" [ "auth"; "token" ] in
  if st <> Unix.WEXITED 0 then failwith ("gh auth token failed: " ^ out);
  String.trim out

(* auth header goes via `--config -` on stdin so the token never appears in argv *)
let auth_cfg token = Printf.sprintf "header = \"Authorization: Bearer %s\"\n" token

let curl url token =
  let out, err, st = run_cmd ~stdin:(auth_cfg token) "curl" [ "-sS"; "--retry"; "5"; "--retry-delay"; "3"; "--retry-all-errors";
    "-H"; "User-Agent: style-scan"; "--config"; "-"; url ] in
  (match st with
   | Unix.WEXITED 0 -> ()
   | Unix.WEXITED n -> failwith (Printf.sprintf "curl failed (%d): %s" n (String.sub err 0 (min 200 (String.length err))))
   | _ -> failwith ("curl killed: " ^ String.sub err 0 (min 200 (String.length err))));
  out

let exists name = Sys.file_exists (Filename.concat dir name)

let curl_json url token =
  let out = curl url token in
  Yojson.Safe.from_string out

let http_post_json url token body =
  let out, err, st = run_cmd ~stdin:(auth_cfg token) "curl" [ "-sS"; "--retry"; "5"; "--retry-delay"; "3"; "--retry-all-errors";
    "-X"; "POST"; url;
    "-H"; "User-Agent: style-scan";
    "-H"; "Content-Type: application/json";
    "--data-binary"; body;
    "--config"; "-" ] in
  (match st with
   | Unix.WEXITED 0 -> ()
   | _ -> failwith ("curl POST failed: " ^ err));
  Yojson.Safe.from_string out

let write name json =
  let path = Filename.concat dir name in
  let oc = open_out path in
  Yojson.Safe.pretty_to_channel ~std:true oc json;
  close_out oc;
  Printf.printf "wrote %s\n" path

(* page through a paginated REST endpoint, collecting array pages.
   Stops at an empty page; 100 pages is a loud safety cap, not a silent stop. *)
let rest_all token (url_tpl : (_, unit, string) format) =
  let rec go page acc =
    if page > 100 then failwith (Printf.sprintf "more than 100 pages at %s — corpus would be truncated" (Printf.sprintf url_tpl 0));
    let url = Printf.sprintf url_tpl page in
    let arr = curl_json url token in
    (match arr with
     | `List items ->
       if items = [] then List.concat (List.rev acc)
       else begin
         if page mod 5 = 0 || page = 1 then
           Printf.printf "  page %d: %d items\n" page (List.length items);
         ignore (Unix.sleep 1);
         go (page + 1) (items :: acc)
       end
     | _ -> failwith "expected JSON array")
  in
  go 1 []

let () =
  let token = token () in
  (* 1. all closed PRs -> merged ones (skipped when already fetched) *)
  if not (exists "merged_prs.json") then begin
    let closed = rest_all token
        "https://api.github.com/repos/clj-kondo/clj-kondo/pulls?state=closed&per_page=100&sort=created&direction=desc&page=%d" in
    let merged = List.filter (fun x -> Yojson.Safe.(Util.member "merged_at" x <> `Null)) closed in
    write "merged_prs.json" (`List merged);
    Printf.printf "merged PRs: %d (of %d closed)\n" (List.length merged) (List.length closed)
  end;

  (* 2. all inline review comments (skipped when already fetched) *)
  if not (exists "review_comments.json") then begin
    let rc = rest_all token
        "https://api.github.com/repos/clj-kondo/clj-kondo/pulls/comments?per_page=100&page=%d" in
    write "review_comments.json" (`List rc);
    Printf.printf "review comments: %d\n" (List.length rc)
  end;

  (* 3. conversation comments + review bodies via GraphQL *)
  let query =
    {|query($cursor:String){repository(owner:"clj-kondo",name:"clj-kondo"){
      prs: pullRequests(first: 100, after: $cursor, states: MERGED, orderBy: {field: CREATED_AT, direction: ASC}){
        pageInfo { endCursor hasNextPage }
        nodes { number
          comments(first: 100){ nodes { body author { login } createdAt } pageInfo { hasNextPage } }
          reviews(first: 30){ nodes { body author { login } submittedAt } pageInfo { hasNextPage } } } } } }|}
  in
  let gql_page cursor =
    let body = Yojson.Safe.to_string (`Assoc [
        "query", `String query;
        "variables", `Assoc [ "cursor", match cursor with Some c -> `String c | None -> `Null ] ]) in
    let resp = http_post_json "https://api.github.com/graphql" token body in
    (match Yojson.Safe.Util.(member "data" resp) with
     | `Assoc [ ("repository", repo) ] -> repo
     | _ -> failwith ("graphql error: " ^ Yojson.Safe.to_string resp))
  in
  let rec go cursor acc =
    let repo = gql_page cursor in
    let prs = Yojson.Safe.(Util.member "prs" repo) in
    let nodes = Yojson.Safe.(Util.member "nodes" prs) in
    (match nodes with
     | `List ns when ns <> [] ->
       acc := ns :: !acc;
       (match Yojson.Safe.(Util.member "pageInfo" prs) with
        | pi when Yojson.Safe.(Util.to_bool (Util.member "hasNextPage" pi)) ->
          let end_cursor = Yojson.Safe.(Util.to_string (Util.member "endCursor" pi)) in
          go (Some end_cursor) acc
        | _ -> List.concat (List.rev !acc))
     | _ -> List.concat (List.rev !acc))
  in
  let all_prs = go None (ref []) in
  (* per-PR overflow would silently truncate the corpus — refuse instead *)
  List.iter (fun node ->
    let open Yojson.Safe.Util in
    let n = node |> member "number" |> to_int in
    let truncated kind =
      failwith (Printf.sprintf "PR #%d: more than one page of %s — corpus would be truncated" n kind) in
    let has_more name =
      let pi = node |> member name |> member "pageInfo" in
      Yojson.Safe.(to_bool (Util.member "hasNextPage" pi)) in
    (if has_more "comments" then truncated "conversation comments");
    (if has_more "reviews" then truncated "reviews")) all_prs;
  let conv = List.map (fun node ->
      let n = Yojson.Safe.(Util.to_int (Util.member "number" node)) in
      (string_of_int n, node)) all_prs in
  write "pr_conversations.json" (`Assoc (List.rev conv));
  Printf.printf "PRs with conversations: %d\n" (List.length conv)