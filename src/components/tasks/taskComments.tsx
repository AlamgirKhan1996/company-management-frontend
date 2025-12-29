"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCommentsByTask,addMockComment}from"@/mocks/comments";

interface Props {
  taskId: string;
  author: string;
}

export default function TaskComments({ taskId }: Props) {
  const [message, setMessage] = useState("");

  const comments = getCommentsByTask(taskId);

  function submitComment(){
    if(!message.trim())return;

    addMockComment(taskId,message,"Admin");
    setMessage("");
  }
    return (
        <div className="space-y-2 border-t pt-3">
            <p className="text-sm font-semibold">Comments</p>
            <div className="space-y-1">
                {comments.map((comment) => (
                    <div key={comment.id} className="text-sm bg-gray-100 p-2 rounded">
                        <span className="font-medium">User {comment.author}:</span>{" "} {comment.message}
                        <div className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</div>
                    </div>
                ))}
            </div>

            <div className="flex space-x-2 mt-2">
                <Input
                placeholder="Write a comment..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}/>
                <Button size="sm" onClick={submitComment}>Submit</Button>
            </div>
        </div>
    );
}