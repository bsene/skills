(* Fetch c2 wiki pages as plain text: c2fetch OUT_DIR Page1 Page2 ... *)
let base = "https://c2.com/wiki/remodel/pages/"

let fetch name =
  let tmp = Filename.temp_file "c2" ".json" in
  let cmd = Printf.sprintf "curl -sfL -m 30 %s -o %s" (Filename.quote (base ^ name)) tmp in
  let ok = Sys.command cmd = 0 in
  let r =
    if not ok then None
    else
      match Yojson.Safe.from_file tmp with
      | `Assoc l -> (
          match List.assoc_opt "text" l with Some (`String s) -> Some s | _ -> None)
      | _ -> None
      | exception _ -> None
  in
  Sys.remove tmp;
  r

let () =
  match Array.to_list Sys.argv with
  | _ :: dir :: names ->
      List.iter
        (fun n ->
          match fetch n with
          | Some t ->
              let oc = open_out (Filename.concat dir (n ^ ".txt")) in
              output_string oc t;
              close_out oc
          | None -> prerr_endline ("missing: " ^ n))
        names
  | _ -> prerr_endline "usage: c2fetch OUT_DIR Page..."
