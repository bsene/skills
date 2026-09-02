(* Minimal ocamllsp client: type-of-expression, completion, diagnostics.
   Speaks LSP (JSON-RPC 2.0) to `ocamllsp` over stdio via raw file descriptors
   (no threads; Unix.select drives the push/pull read loop).

   Usage:
     main.exe ERRORS <file.ml> [--lsp PATH] [--line L] [--char C]
     main.exe TYPE   <file.ml> [--lsp PATH] [--line L] [--char C]
     main.exe COMPL  <file.ml> [--lsp PATH] [--line L] [--char C]
     main.exe -- <snippet...>      (inline source, path defaults to /tmp/q.ml)
     main.exe --selftest           (framing round-trip check)
   The server is set with --lsp, else $OCAMLLSP, else $HOME/.opam/camelot/bin/ocamllsp.
*)

open Stdlib
module Y = Yojson.Safe


let default_lsp () =
  match Sys.getenv_opt "OCAMLLSP" with
  | Some p -> p
  | None -> Filename.concat (Sys.getenv "HOME") ".opam/camelot/bin/ocamllsp"

type reader = { fd : Unix.file_descr; buf : Buffer.t }

(* ---------- process + raw fds ---------- *)
let spawn lsp =
  let in_r, in_w = Unix.pipe () in    (* we write to child stdin *)
  let out_r, out_w = Unix.pipe () in  (* we read  from child stdout *)
  let null = Unix.openfile "/dev/null" [ Unix.O_WRONLY ] 0 in
  let pid =
    Unix.create_process lsp [| lsp |] in_r out_w null
  in
  Unix.close in_r; Unix.close out_w; Unix.close null;
  (pid, out_r, in_w)

let write_all fd s =
  let b = Bytes.of_string s in
  let rec go off =
    if off < Bytes.length b then
      go (off + Unix.write fd b off (Bytes.length b - off))
  in
  go 0

(* ---------- JSON-RPC framing ---------- *)
let find_sub ?(start = 0) s sub =
  let n = String.length s and m = String.length sub in
  let rec go i = if i + m > n then None
                 else if String.sub s i m = sub then Some i
                 else go (i + 1)
  in
  go start

let content_length header =
  let n = ref 0 in
  String.split_on_char '\n' header
  |> List.iter (fun l ->
         let l = String.trim l in
         (match String.index_opt l ':' with
          | Some c ->
              let k = String.trim (String.sub l 0 c) in
              let v = String.trim (String.sub l (c + 1) (String.length l - c - 1)) in
              if String.lowercase_ascii k = "content-length" then n := int_of_string v
          | None -> ()));
  !n

let extract_message buf =
  let s = Buffer.contents buf in
  match find_sub s "\r\n\r\n" with
  | None -> None
  | Some hend ->
      let clen = content_length (String.sub s 0 hend) in
      let total = hend + 4 + clen in
      if Buffer.length buf < total then None
      else begin
        let body = String.sub s (hend + 4) clen in
        let rest = String.sub s total (Buffer.length buf - total) in
        Buffer.clear buf; Buffer.add_string buf rest;
        Some (Y.from_string body)
      end

let read_frame ~timeout r =
  let deadline = Unix.gettimeofday () +. timeout in
  let rec go () =
    match extract_message r.buf with
    | Some j -> Some j
    | None ->
        let t = deadline -. Unix.gettimeofday () in
        if t <= 0. then None
        else begin
          let ready, _, _ = Unix.select [ r.fd ] [] [] t in
          if ready = [] then None
          else begin
            let chunk = Bytes.create 65536 in
            let n = Unix.read r.fd chunk 0 65536 in
            if n = 0 then None
            else (Buffer.add_subbytes r.buf chunk 0 n; go ())
          end
        end
  in
  go ()

(* ---------- JSON building ---------- *)
let msg ?id ~method' params =
  let l = [ "jsonrpc", `String "2.0"; "method", `String method' ] in
  let l = match id with Some i -> ("id", `Int i) :: l | None -> l in
  let l = match params with Some p -> ("params", p) :: l | None -> l in
  `Assoc l

let send fd j =
  let body = Y.to_string j in
  write_all fd (Printf.sprintf "Content-Length: %d\r\n\r\n%s" (String.length body) body)

let debug = Sys.getenv_opt "OCAMLLSP_DEBUG" <> None

(* predicate-based read: collect frames until `pred` matches *)
let rec await ~timeout r pred =
  match read_frame ~timeout r with
  | Some j ->
      (if debug then Printf.eprintf "[frame] %s\n" (Y.to_string j));
      if pred j then Some j else await ~timeout r pred
  | None -> None

let assoc = function `Assoc l -> Some l | _ -> None
let is_reply id = function `Assoc l -> List.assoc_opt "id" l = Some (`Int id) | _ -> false

(* ---------- LSP session ---------- *)
let run ~want ~path ~text ~line ~char ~lsp =
  let pid, out_r, in_w = spawn lsp in
  let r = { fd = out_r; buf = Buffer.create 4096 } in
  let uri = "file://" ^ path in
  let root = Filename.dirname path in
  (* initialize and wait for its reply *)
  let init =
    msg ~id:1 ~method':"initialize"
      (Some (`Assoc
        [ "processId", `Int (Unix.getpid ());
          "rootUri", `String ("file://" ^ root);
          "capabilities", `Assoc [] ]))
  in
  send in_w init;
  (match await ~timeout:15. r (is_reply 1) with Some _ -> () | None -> failwith "timed out waiting for ocamllsp initialize");
  send in_w (msg ~method':"initialized" None);
  send in_w
    (msg ~method':"textDocument/didOpen"
       (Some (`Assoc
         [ "textDocument",
           `Assoc [ "uri", `String uri; "languageId", `String "ocaml";
                    "version", `Int 1; "text", `String text ] ])));
  let output =
    match want with
    | "ERRORS" ->
        let diags = ref None in
        let _ =
          await ~timeout:8. r (fun j ->
              match assoc j with
              | Some l ->
                  (match List.assoc_opt "method" l with
                   | Some (`String "textDocument/publishDiagnostics") ->
                       (match List.assoc_opt "params" l with
                        | Some (`Assoc p) ->
                            (match List.assoc_opt "uri" p with
                             | Some (`String u) when u = uri ->
                                 (match List.assoc_opt "diagnostics" p with
                                  | Some d -> diags := Some d; true
                                  | None -> false)
                             | _ -> false)
                        | _ -> false)
                   | _ -> false)
              | _ -> false)
        in
        ( match !diags with
          | Some d -> `Assoc [ "path", `String path; "diagnostics", d ]
          | None -> `Assoc [ "path", `String path; "diagnostics", `List []; "note", `String "no diagnostics before timeout" ] )
    | ("TYPE" | "COMPL") as w ->
        let method' = if w = "TYPE" then "textDocument/hover" else "textDocument/completion" in
        let reqid = 2 in
        send in_w
          (msg ~id:reqid ~method'
             (Some (`Assoc
               [ "textDocument", `Assoc [ "uri", `String uri ];
                 "position", `Assoc [ "line", `Int line; "character", `Int char ] ])));
        (match await ~timeout:15. r (is_reply reqid) with
         | Some resp -> `Assoc [ "path", `String path; String.lowercase_ascii w, resp ]
         | None -> `Assoc [ "path", `String path; "error", `String "timeout" ])
    | _ -> failwith (Printf.sprintf "unknown want: %s" want)
  in
  (try send in_w (msg ~id:99 ~method':"shutdown" None) with _ -> ());
  (try send in_w (msg ~method':"exit" None) with _ -> ());
  Unix.close in_w; Unix.close out_r;
  (try ignore (Unix.waitpid [] pid) with _ -> ());
  print_endline (Y.pretty_to_string output)

(* ---------- CLI ---------- *)
let rec parse_args argv ~line ~char ~lsp ~content =
  match argv with
  | "--lsp" :: p :: rest -> parse_args rest ~line ~char ~lsp:p ~content
  | "--line" :: n :: rest -> parse_args rest ~line:(int_of_string n) ~char ~lsp ~content
  | "--char" :: n :: rest -> parse_args rest ~line ~char:(int_of_string n) ~lsp ~content
  | "--" :: rest -> (line, char, lsp, Some (`Inline (String.concat " " rest)))
  | a :: rest when a.[0] <> '-' -> parse_args rest ~line ~char ~lsp ~content:(Some (`File a))
  | _ -> (line, char, lsp, content)

let read_file p = let ic = open_in p in let t = really_input_string ic (in_channel_length ic) in close_in ic; t

let selftest () =
  (* framing round-trip over a pipe: write a framed message, read it back *)
  let rd, w = Unix.pipe () in
  let body = {|"hello"|} in
  write_all w (Printf.sprintf "Content-Length: %d\r\n\r\n%s" (String.length body) body);
  Unix.close w;
  let r = { fd = rd; buf = Buffer.create 128 } in
  match read_frame ~timeout:2. r with
  | Some (`String "hello") -> print_endline "framing ok"; 0
  | _ -> print_endline "framing FAILED"; 1

let () =
  let argv = List.tl (Array.to_list Sys.argv) in
  if List.mem "--selftest" argv then exit (selftest ())
  else
    match argv with
    | want :: rest ->
        let line, char, lsp, content =
          parse_args rest ~line:0 ~char:0 ~lsp:(default_lsp ()) ~content:None
        in
        (match content with
         | Some (`File p) -> run ~want ~path:p ~text:(read_file p) ~line ~char ~lsp
         | Some (`Inline t) -> run ~want ~path:"/tmp/ocamllsp-q.ml" ~text:t ~line ~char ~lsp
         | None ->
             print_endline "usage: main.exe (ERRORS|TYPE|COMPL) <file.ml> [--lsp PATH] [--line L] [--char C] | -- <snippet>";
             exit 2)
    | [] ->
        print_endline "usage: main.exe (ERRORS|TYPE|COMPL) <file.ml> [--lsp PATH] [--line L] [--char C] | -- <snippet>";
        exit 2
