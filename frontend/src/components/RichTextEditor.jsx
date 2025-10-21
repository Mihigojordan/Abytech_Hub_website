import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function RichTextEditor() {
  const [content, setContent] = useState("");

  const handleSave = async () => {
    await fetch("/api/save-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    alert("✅ Report saved to database!");
  };

  return (
    <div className="p-4  flex mx-auto">
   <div className="">
       <h2 className="text-2xl font-bold mb-3">📋 Daily Work Progress Report</h2>

      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        placeholder="Start writing your report..."
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "code-block"],
            ["link", "image"],
            [{ align: [] }],
            ["clean"],
          ],
        }}
        formats={[
          "header",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "code-block",
          "list",
          "bullet",
          "link",
          "image",
          "align",
        ]}
        className="bg-white rounded-xl shadow p-2 min-h-[300px]"
      />

      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        💾 Save to Database
      </button>

   </div>
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">🧾 Preview:</h3>
      <div className="prose prose-lg max-w-none mb-8">
                    <div
                      className="ql-editor"
                      dangerouslySetInnerHTML={{ __html: content || 'No content available' }}
                    />
                  </div>
      </div>
    </div>
  );
}
