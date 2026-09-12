(* Filter the raw corpus down to human-authored comments on merged PRs.
   Reads: merged_prs.json, review_comments.json, pr_conversations.json (same dir)
   Writes: corpus.jsonl — one {kind, pr, author, file, line, created_at, body} per line *)

let dir =
  match Sys.getenv_opt "CORPUS_DIR" with
  | Some d -> d
  | None -> "/Users/birrame.sene/.cache/clj-kondo-style-guide"
let read_json name =
  Yojson.Safe.from_string
    (let ic = open_in (Filename.concat dir name) in
     let n = in_channel_length ic in
     let s = really_input_string ic n in
     close_in ic; s)

let merged_numbers : unit -> int array = fun () ->
  let merged = read_json "merged_prs.json" in
  match merged with
  | `List xs -> Array.of_list
      (List.filter_map (fun x ->
         match Yojson.Safe.(Util.member "number" x) with
         | `Int n -> Some n | _ -> None) xs)
  | _ -> failwith "merged_prs.json: expected array"

let is_bot login =
  let l = String.lowercase_ascii login in
  String.length l >= 3
  && (let ends x s = String.length x >= String.length s
                      && (let off = String.length x - String.length s in
                          String.sub x off (String.length s) = s)
      in
      ends l "bot" || ends l "-ci" || ends l "[bot]"
      || List.mem l [ "bors"; "codecov"; "github-actions"; "clj-kondo-ci";
                      "graalvmbot"; "app" ])

(* Pure acknowledgements / CI noise carry no review signal. *)
let is_noise body =
  String.length (String.trim body) < 15

let () =
  let merged = merged_numbers () in
  let is_merged n = Array.mem n merged in
  let oc = open_out (Filename.concat dir "corpus.jsonl") in
  let n_total = ref 0 and n_kept = ref 0 in
  let emit kind pr author file line created body =
    incr n_total;
    if is_merged pr && not (is_bot author) && String.trim body <> "" && not (is_noise body) then begin
      incr n_kept;
      let json = `Assoc [
        "kind", `String kind; "pr", `Int pr; "author", `String author;
        "file", (match file with Some f -> `String f | None -> `Null);
        "line", (match line with Some l -> `Int l | None -> `Null);
        "created_at", `String created; "body", `String body ] in
      output_string oc (Yojson.Safe.to_string json); output_char oc '\n'
    end
  in
  (* 1. inline review comments *)
  (match read_json "review_comments.json" with
   | `List xs ->
     List.iter (fun c ->
       let open Yojson.Safe.Util in
       let pr_url = c |> member "pull_request_url" |> to_string in
       let pr = int_of_string (Filename.basename pr_url) in
       let file = try Some (c |> member "path" |> to_string) with _ -> None in
       let line = try Some (c |> member "line" |> to_int) with _ -> None in
       let author = c |> member "user" |> member "login" |> to_string in
       let created = c |> member "created_at" |> to_string in
       let body = try c |> member "body" |> to_string with _ -> "" in
       emit "review_comment" pr author file line created body) xs
   | _ -> failwith "review_comments.json: expected array");
  (* 2. conversation comments + review bodies *)
  (match read_json "pr_conversations.json" with
   | `Assoc entries ->
     List.iter (fun (num, node) ->
       let open Yojson.Safe.Util in
       let pr = int_of_string num in
       let comments = member "comments" node |> member "nodes" in
       (match comments with
        | `List cs ->
          List.iter (fun c ->
            let author = try c |> member "author" |> member "login" |> to_string with _ -> "unknown" in
            let created = try c |> member "createdAt" |> to_string with _ -> "" in
            let body = try c |> member "body" |> to_string with _ -> "" in
            emit "conversation" pr author None None created body) cs
        | _ -> ());
       let reviews = member "reviews" node |> member "nodes" in
       (match reviews with
        | `List rs ->
          List.iter (fun r ->
            let author = try r |> member "author" |> member "login" |> to_string with _ -> "unknown" in
            let created = try r |> member "submittedAt" |> to_string with _ -> "" in
            let body = try r |> member "body" |> to_string with _ -> "" in
            emit "review_body" pr author None None created body) rs
        | _ -> ())) entries
   | _ -> failwith "pr_conversations.json: expected assoc");
  close_out oc;
  Printf.printf "total comments: %d, kept: %d\n" !n_total !n_kept