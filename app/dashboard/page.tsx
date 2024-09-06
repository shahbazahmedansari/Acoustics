"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Play, Share2 } from "lucide-react";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import axios from "axios";

interface Video {
  id: string;
  title: string;
  upvotes: number;
  downvotes: number;
}

const REFRESH_INTERVAL_MS = 10 * 1000;

export default function Component() {
  const [inputLink, setInputLink] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [queue, setQueue] = useState<Video[]>([
    {
      id: "dQw4w9WgXcQ",
      title: "Rick Astley - Never Gonna Give You Up",
      upvotes: 10,
      downvotes: 5,
    },
    {
      id: "9bZkp7q19f0",
      title: "PSY - GANGNAM STYLE",
      upvotes: 8,
      downvotes: 5,
    },
    {
      id: "kJQP7kiw5Fk",
      title: "Luis Fonsi - Despacito ft. Daddy Yankee",
      upvotes: 7,
      downvotes: 5,
    },
  ]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const refreshStreams = async () => {
    const res = await fetch(`/api/streams/myStreams`, {
      credentials: "include",
    });
    const json = await res.json();
    console.log(json);
  };

  useEffect(() => {
    refreshStreams();
    const interval = setInterval(() => {
      refreshStreams();
    }, REFRESH_INTERVAL_MS);
  }, []);

  useEffect(() => {
    setQueue(
      [...queue].sort(
        (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
      )
    );
  }, [queue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVideo: Video = {
      id: String(queue.length + 1),
      upvotes: 0,
      downvotes: 0,
      title: `New Song ${queue.length + 1}`,
    };
    setQueue([...queue, newVideo]);
    setInputLink("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputLink(e.target.value);
  };

  const playNext = () => {
    if (queue.length > 0) {
      setCurrentVideo(queue[0]);
      setQueue(queue.slice(1));
    }
  };

  const handleVote = (id: string, isUpvote: boolean) => {
    setQueue(
      queue
        .map((video) =>
          video.id === id
            ? {
                ...video,
                upvotes: isUpvote ? video.upvotes + 1 : video.upvotes,
                downvotes: !isUpvote ? video.downvotes + 1 : video.downvotes,
              }
            : video
        )
        .sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes))
    );
  };

  const handleShare = () => {
    const shareableLink = window.location.href;
    navigator.clipboard.writeText(shareableLink).then(
      () => {
        toast.success("Link copied to clipboard!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy link. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    );
  };

  return (
    <section className="w-full bg-gradient-to-br from-gray-900 via-purple-900 to-fuchsia-900">
      <div className="flex flex-col min-h-screen bg-gray-900 bg-opacity-50 text-gray-100">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-fuchsia-300">
              Song Voting Queue
            </h1>
            <Button
              onClick={handleShare}
              className="bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-fuchsia-500 text-fuchsia-300"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">
                Add a Song
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  value={inputLink}
                  onChange={handleInputChange}
                  placeholder="Paste YouTube video link"
                  className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-purple-500"
                />
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Add to Queue
                </Button>
              </form>
              {previewId && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-purple-300">
                    Preview
                  </h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={"/public/next.svg"}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">
                Now Playing
              </h2>
              <div className="aspect-w-16 aspect-h-9">
                {currentVideo ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideo}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  ></iframe>
                ) : (
                  <div className="flex justify-center m-10">
                    No video playing
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">
              Upcoming Songs
            </h2>
            <div className="space-y-4">
              {queue.map((video) => (
                <Card key={video.id} className="bg-gray-700 border-gray-600">
                  <CardContent className="flex items-center space-x-4 p-4">
                    <Image
                      src={`/public/next.svg`}
                      alt={video.title}
                      width={120}
                      height={90}
                      className="rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-fuchsia-300">
                        {video.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleVote(video.id, true)}
                          className="bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-purple-500"
                        >
                          <ThumbsUp className="h-4 w-4 text-purple-300" />
                          <span className="text-sm font-semibold text-purple-300">
                            {video.upvotes}
                          </span>
                        </Button>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleVote(video.id, false)}
                          className="bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-fuchsia-500"
                        >
                          <ThumbsDown className="h-4 w-4 text-fuchsia-300" />
                          <span className="text-sm font-semibold text-fuchsia-300">
                            {video.downvotes}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </section>
  );
}
