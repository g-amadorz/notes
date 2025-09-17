export default function Home() {
    return (
      <div className="bg-red-500 p-5">
        <h1 className="text-white text-2xl font-bold">Tailwind CSS Test</h1>
        <p className="text-white mt-2">If you can see this styled properly, Tailwind is working!</p>
        <button className="btn-primary mt-4">Primary Button</button>
        <div className="card mt-4">
          <h2 className="text-xl font-semibold mb-2">Card Component</h2>
          <p className="text-gray-600">This card uses custom Tailwind component classes.</p>
        </div>
      </div>
    );
}