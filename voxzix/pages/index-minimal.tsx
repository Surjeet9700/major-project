import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>VoxBiz - AI-Powered Photography Studio | World's First Voice Agent Booking</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            VoxBiz - AI Photography Booking
          </h1>
          <p className="text-xl text-center text-gray-300">
            World's First AI Voice Agent for Photography Booking
          </p>
        </div>
      </div>
    </>
  );
}
