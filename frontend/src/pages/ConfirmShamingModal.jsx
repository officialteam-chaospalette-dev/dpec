import React from "react";

export default function ConfirmShamingModal({ visible, onContinue, onCancel }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[500px] p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">本当に購入をやめますか？</h2>
        <p className="text-gray-600 mb-8">
          あなたのような多くの人が後悔しています。
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onContinue}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold"
          >
            続ける（おすすめ）
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg"
          >
            いいえ、私は損したいです
          </button>
        </div>
      </div>
    </div>
  );
}
