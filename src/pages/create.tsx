import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { generateKeyBetween } from "fractional-indexing";
import { useRouter } from "next/router";
import { uuid } from "../lib/utils";
import { useRef, useState } from "react";
import tags from "./tags";

type Tag = {
  id: string;
  name: string;
};

// export default function Create({ tagId = "64b9c132-006c-4302-a3d1-f7254429808a" }: { tagId: string }) {
export default function Create() {
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "64b9c132-006c-4302-a3d1-f7254429808a",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState("");
  const queryClient = useQueryClient();

  const { data: allTags } = useQuery<{ [key: string]: Tag }>("allTags", async () => {
    const result = await axios.post("/api/db", [{ query: `select * from tag` }]);
    return Object.fromEntries(result.data.map((tag) => [tag.id, tag]));
  });

  if (!allTags) return null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <div>
        <h1>Tags</h1>
        <div className="flex flex-row flex-wrap">
          {selectedTags
            .map((id) => allTags[id])
            .map((tag) => (
              <span className="bg-blue-200 rounded px-2 py-1 m-1 flex items-center" key={tag.id}>
                {tag.name}
                <button
                  className="ml-2 text-sm text-red-500"
                  onClick={() => setSelectedTags((tags) => tags.filter((t) => t !== id))}
                >
                  x
                </button>
              </span>
            ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="border rounded p-1 m-1"
          defaultValue={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a new tag..."
        />
        {newTag && (
          <div className="absolute bg-white border rounded mt-1">
            {Object.values(allTags)
              .filter((tag) => !selectedTags.includes(tag.id))
              .filter((tag) => tag.name.includes(newTag))
              .map((tag) => (
                <div
                  key={tag.id}
                  className="p-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setSelectedTags((tags) => [...tags, tag.id]);
                    setNewTag("");
                    if (inputRef.current) {
                      inputRef.current.value = "";
                    }
                  }}
                >
                  {tag.name}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
