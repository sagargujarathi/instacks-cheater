interface ITACType {
  onClick: () => void;
}

const TermsAndConditions = ({ onClick }: ITACType) => {
  return (
    <div className="max-w-[600px] mx-auto bg-white shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Terms and Conditions</h1>
        <button
          onClick={onClick}
          className="bg-white text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Go Back
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[70vh] space-y-4">
        <div className="border-l-4 border-red-500 pl-3 py-2">
          <h2 className="text-lg font-semibold">1. Use at Your Own Risk:</h2>
          <p className="mt-1 text-sm text-gray-700">
            This extension is provided "as is" without any warranties, express
            or implied. <br />
            The use of this extension to circumvent exam security measures may
            be illegal and may violate the terms of service of the online exam
            platform.
          </p>
          <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
            <li>
              Academic penalties (e.g., grade deductions, course failure,
              suspension, expulsion)
            </li>
            <li>Legal action</li>
            <li>Damage to your computer or device</li>
            <li>Loss of data</li>
            <li>Reputational damage</li>
          </ul>
        </div>

        <div className="border-l-4 border-yellow-500 pl-3 py-2">
          <h2 className="text-lg font-semibold">2. Academic Integrity:</h2>
          <p className="mt-1 text-sm text-gray-700">
            This extension is not intended to be used for cheating or academic
            dishonesty. <br /> Academic integrity is paramount. <br />
            Using this extension to cheat on exams is unethical and may have
            severe consequences.
          </p>
        </div>

        <div className="border-l-4 border-blue-500 pl-3 py-2">
          <h2 className="text-lg font-semibold">
            3. Compliance with Laws and Regulations:
          </h2>
          <p className="mt-1 text-sm text-gray-700">
            You are responsible for ensuring that your use of this extension
            complies with all applicable laws and regulations, including
            copyright laws, data privacy laws, and any other relevant laws.
          </p>
        </div>

        <div className="border-l-4 border-gray-400 pl-3 py-2">
          <h2 className="text-lg font-semibold">4. Disclaimer of Liability:</h2>
          <p className="mt-1 text-sm text-gray-700">
            The developers of this extension shall not be liable for any damages
            or losses arising from the use of this extension, including but not
            limited to direct, indirect, incidental, special, or consequential
            damages.
          </p>
        </div>

        <div className="border-l-4 border-gray-400 pl-3 py-2">
          <h2 className="text-lg font-semibold">5. No Endorsement:</h2>
          <p className="mt-1 text-sm text-gray-700">
            This extension is not endorsed by any educational institution or
            online exam platform.
          </p>
        </div>

        <div className="border-l-4 border-gray-400 pl-3 py-2">
          <h2 className="text-lg font-semibold">6. Right to Modify:</h2>
          <p className="mt-1 text-sm text-gray-700">
            The developers reserve the right to modify or discontinue this
            extension at any time without notice.
          </p>
        </div>

        <div className="border-l-4 border-green-500 pl-3 py-2">
          <h2 className="text-lg font-semibold">7. Consent:</h2>
          <p className="mt-1 text-sm text-gray-700">
            By using this extension, you acknowledge that you have read and
            understood these terms and conditions and agree to be bound by them.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
        <button onClick={onClick} className="btn-primary text-sm">
          I Understand and Accept
        </button>
        <span className="text-xs text-gray-500">
          Last updated: December 2024
        </span>
      </div>
    </div>
  );
};

export default TermsAndConditions;
