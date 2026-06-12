"use client";

import Link from "next/link";


  const Reload = () => {
    window.location.reload();
  }


export default function GenreErrorOptions() {
    return (
         <p>Your Options: <span onClick={Reload} className="cursor-pointer text-primary hover:underline">Reload</span> or <Link href="/home" className="text-primary hover:underline">Go to Homepage</Link></p>
    )
}

