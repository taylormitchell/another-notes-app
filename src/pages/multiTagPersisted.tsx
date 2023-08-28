// import axios from "axios";
// import { useMutation, useQuery, useQueryClient } from "react-query";
// import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";
// import { useRouter } from "next/router";
// import { uuid } from "../lib/utils";
// import { useRef, useState } from "react";

// type Tag = {
//   id: string;
//   name: string;
// };

// type TagWithLastPosition = Tag & { prev_last_position: string };

// type Note = {
//   id: string;
//   content: string;
//   created_at: string;
//   positions: { [tagId: string]: string };
// };

// // const prevLastPositions = [
// //   { tagId: "64b9c132-006c-4302-a3d1-f7254429808a", position: "a0" },
// //   { tagId: "a0b9c132-006c-4302-a3d1-f7254429808a", position: "a1" },
// //   { tagId: "b0b9c132-006c-4302-a3d1-f7254429808a", position: null },
// // ];

// // const notes = [
// //   {
// //     id: "abcde",
// //     content: "note 1",
// //     created_at: "2021-01-01",
// //     position: [
// //       { tagId: "64b9c132-006c-4302-a3d1-f7254429808a", position: "a0" },
// //       { tagId: "a0b9c132-006c-4302-a3d1-f7254429808a", position: "a3" },
// //     ],
// //   },
// //   {
// //     id: "fghij",
// //     content: "note 2",
// //     created_at: "2021-01-02",
// //     position: [
// //       { tagId: "64b9c132-006c-4302-a3d1-f7254429808a", position: "a1" },
// //       { tagId: "a0b9c132-006c-4302-a3d1-f7254429808a", position: "a2" },
// //     ],
// //   },
// // ];

// // export default function Create({ tagId = "64b9c132-006c-4302-a3d1-f7254429808a" }: { tagId: string }) {
// export default function Create() {
//   const [selectedTags, setSelectedTags] = useState<string[]>([
//     "64b9c132-006c-4302-a3d1-f7254429808a",
//   ]);
//   console.log(selectedTags);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [newTag, setNewTag] = useState("");
//   const queryClient = useQueryClient();

//   // Get all tags and, if they have any entries, the last positioned note in the tag_entries table
//   const { data: allTags } = useQuery<{ [key: string]: TagWithLastPosition }>(
//     "allTags",
//     async () => {
//       const result = await axios.post("/api/db", [
//         {
//           query: `select tag.*, max(tag_entries.position) prev_last_position from tag left join tag_entries on tag.id = tag_entries.tag_id group by tag.id`,
//         },
//       ]);
//       return result.data.reduce((acc, { id, name, prev_last_position }) => {
//         acc[id] = { id, name, prev_last_position: prev_last_position ?? null };
//         return acc;
//       }, {});
//     }
//   );

//   const { data: notes, isLoading: notesLoading } = useQuery<Note[], any>(
//     ["note", selectedTags[0]],
//     async () => {
//       const result = await axios.post("/api/db", [
//         {
//           query: `select note.*, tag_entries.position from note join tag_entries on note.id = tag_entries.note_id where tag_entries.tag_id = $1`,
//           params: [selectedTags[0]],
//         },
//       ]);
//       return result.data.map((row) => {
//         const note: Note = {
//           id: row.id,
//           content: row.content,
//           created_at: row.created_at,
//           positions: { [selectedTags[0]]: row.position },
//         };
//         return note;
//       });
//     }
//   );

//   const { mutate: createNote } = useMutation(
//     async (note: Note) => {
//       console.log("new note:", note);
//       await axios.post("/api/db", [
//         {
//           query: `insert into note (id, content, created_at) values ($1, $2, $3)`,
//           params: [note.id, note.content, note.created_at],
//         },
//         ...Object.entries(note.positions).map(([tagId, position]) => ({
//           query: `insert into tag_entries (tag_id, note_id, position) values ($1, $2, $3)`,
//           params: [tagId, note.id, position],
//         })),
//       ]);
//     },
//     {
//       onMutate: (note) => {
//         const notes = queryClient.getQueryData(["note", selectedTags[0]]) as any[];
//         queryClient.setQueryData(["note", selectedTags[0]], [...notes, note]);
//       },
//     }
//   );

//   const { mutate: updateNote } = useMutation(
//     async ({ id, content }: { id: string; content: string }) => {
//       await axios.post("/api/db", [
//         {
//           query: `update note set content = $1 where id = $2`,
//           params: [content, id],
//         },
//       ]);
//     },
//     {
//       onMutate: (note) => {
//         const notes = queryClient.getQueryData(["note", selectedTags[0]]) as any[];
//         const updatedNotes = notes.map((n) => {
//           if (n.id === note.id) {
//             return { ...n, ...note };
//           }
//           return n;
//         });
//         queryClient.setQueryData(["note", selectedTags[0]], updatedNotes);
//       },
//     }
//   );

//   const { mutate: deleteNote } = useMutation(
//     async (id: string) => {
//       await axios.post("/api/db", [
//         {
//           query: `delete from note where id = $1`,
//           params: [id],
//         },
//       ]);
//     },
//     {
//       onMutate: (id) => {
//         const notes = queryClient.getQueryData(["note", selectedTags[0]]) as any[];
//         const updatedNotes = notes.filter((n) => n.id !== id);
//         queryClient.setQueryData(["note", selectedTags[0]], updatedNotes);
//       },
//     }
//   );

//   const { mutate: addTag } = useMutation(
//     async (tagId: string) => {
//         await axios.post("/api/db", [
//             {
//             query: `insert into tag_entries (tag_id, note_id, position) values ($1, $2, $3)`,
//             params: [tagId, notes[0].id, generateKeyBetween(null, null)],
//             },
//         ]);
//     }

//   if (!allTags || notesLoading) return null;

//   const sortedNotes = notes.sort((a, b) => {
//     const aPos = Object.values(a.positions)[0];
//     const bPos = Object.values(b.positions)[0];
//     if (aPos === bPos) {
//       return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
//     }
//     return aPos > bPos ? 1 : -1;
//   });

//   // If notes have been added, the last position is the last note's position.
//   // Otherwise, it's the tag's last position at load time.
//   const lastPositions =
//     sortedNotes.slice(-1)[0]?.positions ??
//     Object.fromEntries(selectedTags.map((tagId) => [tagId, allTags[tagId].prev_last_position]));

//   console.log({ sortedNotes, lastPositions });
//   //   const lastPosition = sortedNotes.slice(-1)[0]?.position ?? null;

//   return (
//     <div className="max-w-2xl mx-auto flex flex-col items-center">
//       <div>
//         <h1>Tags</h1>
//         <div className="flex flex-row flex-wrap">
//           {selectedTags
//             .slice(1)
//             .map((id) => allTags[id])
//             .map((tag) => (
//               <span className="bg-blue-200 rounded px-2 py-1 m-1 flex items-center" key={tag.id}>
//                 {tag.name}
//                 <button
//                   className="ml-2 text-sm text-red-500"
//                   onClick={() => setSelectedTags((tags) => tags.filter((t) => t !== tag.id))}
//                 >
//                   x
//                 </button>
//               </span>
//             ))}
//         </div>
//         <input
//           ref={inputRef}
//           type="text"
//           className="border rounded p-1 m-1"
//           defaultValue={newTag}
//           onChange={(e) => setNewTag(e.target.value)}
//           placeholder="Add a new tag..."
//         />
//         {newTag && (
//           <div className="absolute bg-white border rounded mt-1">
//             {Object.values(allTags)
//               .filter((tag) => !selectedTags.includes(tag.id))
//               .filter((tag) => tag.name.includes(newTag))
//               .map((tag) => (
//                 <div
//                   key={tag.id}
//                   className="p-1 hover:bg-gray-200 cursor-pointer"
//                   onClick={() => {
//                     setSelectedTags((tags) => [...tags, tag.id]);
//                     setNewTag("");
//                     if (inputRef.current) {
//                       inputRef.current.value = "";
//                     }
//                   }}
//                 >
//                   {tag.name}
//                 </div>
//               ))}
//           </div>
//         )}
//       </div>
//       <ul className="space-y-4">
//         {notes.map((note) => (
//           <li
//             key={note.id}
//             className="max-w-lg mx-auto border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
//             draggable="true"
//             // onDragStart={(e) => {
//             //   e.dataTransfer.setData("text/plain", note.id);
//             // }}
//             // onDrop={(e) => {
//             //   // Swap positions
//             //   e.preventDefault();
//             //   const draggedNoteId = e.dataTransfer.getData("text/plain");
//             //   const draggedNote = notes.find((n) => n.id === draggedNoteId);
//             //   updatePosition({ id: draggedNoteId, position: note.position });
//             //   updatePosition({ id: note.id, position: draggedNote.position });
//             // }}
//           >
//             <div className="rounded overflow-hidden shadow-md bg-white">
//               <div
//                 className="p-4"
//                 contentEditable
//                 suppressContentEditableWarning
//                 onBlur={(e) => {
//                   const content = e.currentTarget.textContent;
//                   updateNote({ id: note.id, content });
//                 }}
//                 // // delete on backspace if empty
//                 onKeyDown={(e) => {
//                   if (e.key === "Backspace" && e.currentTarget.textContent === "") {
//                     e.preventDefault();
//                     deleteNote(note.id);
//                   }
//                 }}
//                 dangerouslySetInnerHTML={{ __html: note.content }}
//               />
//             </div>
//           </li>
//         ))}
//       </ul>
//       <button
//         className="w-8 border border-black rounded-md my-4"
//         onClick={() =>
//           createNote({
//             id: uuid(),
//             content: "",
//             created_at: new Date().toISOString(),
//             positions: Object.fromEntries(
//               selectedTags.map((tagId) => [tagId, generateKeyBetween(lastPositions[tagId], null)])
//             ),
//           })
//         }
//       >
//         +
//       </button>
//     </div>
//   );
// }

export default function () {}
