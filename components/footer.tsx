import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black/50 border-t border-gray-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-400">
          Designed and hosted by{" "}
          <a
            href="https://www.linkedin.com/in/matthew-sargeant-350517140/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-400 transition-colors inline-flex items-center gap-1"
          >
            Matthew Sargeant
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </footer>
  );
}
