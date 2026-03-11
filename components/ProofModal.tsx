type Props = {
  image: string;
  onClose: () => void;
};

export default function ProofModal({ image, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow">
        <img src={image} className="max-h-[500px]" />
        <button
          onClick={onClose}
          className="mt-3 bg-red-600 text-white px-3 py-1 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}