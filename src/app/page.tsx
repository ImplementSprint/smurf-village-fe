import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full items-center justify-center py-8 px-4">
        <Image
          src="/dinosaur_illustration.jpg"
          alt="Dinosaur"
          width={900}
          height={600}
          priority
          className="rounded-lg shadow-lg object-contain max-w-full h-auto"
        />
      </main>
    </div>
  );
}
