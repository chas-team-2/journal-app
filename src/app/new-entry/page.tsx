"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiCreateEntry } from "@/lib/api/entries";
import { apiGetCurrentUser } from "@/lib/api/auth";
import Header from "@/components/Header";
import { Upload, X, Loader2, FileText } from "lucide-react";

export default function NewEntryPage() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [displayDate, setDisplayDate] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);

	useEffect(() => {
		async function checkAuth() {
			const user = await apiGetCurrentUser();
			if (!user) {
				router.push("/login");
			}
		}

		checkAuth();

		// Set date on client side only to avoid hydration mismatch
		setDisplayDate(new Date().toLocaleDateString("en-GB", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		}));
	}, [router]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (file.type !== 'application/pdf') {
			setFileError('Only PDF files are allowed');
			return;
		}

		// Validate file size
		if (file.size > 2 * 1024 * 1024) {
			setFileError('File is too large (max 2MB)');
			return;
		}

		setFileError(null);
		setSelectedFile(file);
	};

	const handleRemoveFile = () => {
		setSelectedFile(null);
		setFileError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!title.trim() || !content.trim()) {
			setError("Title and content are required");
			return;
		}

		setLoading(true);

		try {
			// Create entry first
			const entry = await apiCreateEntry({ title, content });

			// If file is selected, upload it
			if (selectedFile) {
				const formData = new FormData();
				formData.append('file', selectedFile);
				formData.append('entryId', entry.id);

				const uploadResponse = await fetch('/api/files', {
					method: 'POST',
					body: formData,
				});

				if (!uploadResponse.ok) {
					console.error('File upload failed, but entry was created');
				}
			}

			router.push("/dashboard");
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to create entry";
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen">
			<Header />

			<main className="max-w-3xl mx-auto px-6 py-12">
				<div className="mb-8">
					<button
						onClick={() => router.back()}
						className="text-warm-gray hover:text-dark-brown dark:hover:text-beige cursor-pointer text-sm mb-4"
					>
						← Back to entries
					</button>
					<h1 className="text-4xl font-serif ">
						New Entry
					</h1>
					<p className="text-warm-gray text-sm">{displayDate}</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="title"
							className="block text-sm mb-2 "
						>
							Title
						</label>
						<input
							id="title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="input-field text-xl font-serif"
							placeholder="Give your entry a title..."
							required
							disabled={loading}
						/>
					</div>

					<div>
						<label
							htmlFor="content"
							className="block text-sm mb-2 "
						>
							Content
						</label>
						<textarea
							id="content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="input-field min-h-[400px] resize-y leading-relaxed"
							placeholder="Write your thoughts..."
							required
							disabled={loading}
						/>
					</div>

					<div className="space-y-3">
						<label className="block text-sm font-medium text-dark-brown dark:text-dark-text">
							PDF Attachment (optional)
						</label>

						{selectedFile ? (
							<div className="flex items-center justify-between p-3 bg-beige/50 dark:bg-dark-surface/50 rounded-sm border border-warm-gray/20">
								<div className="flex items-center gap-3 min-w-0 flex-1">

									<FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />

									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-dark-brown dark:text-dark-text truncate">
											{selectedFile.name}
										</p>
										<p className="text-xs text-warm-gray">
											{(selectedFile.size / 1024).toFixed(1)} KB
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={handleRemoveFile}
									disabled={loading}
									className="p-2 text-warm-gray hover:text-red-600 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
									title="Remove file"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						) : (
							<label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-warm-gray/30 dark:border-warm-gray/20 rounded-sm cursor-pointer hover:border-warm-gray/50 dark:hover:border-warm-gray/40 transition-colors">
								<input
									type="file"
									accept="application/pdf"
									onChange={handleFileSelect}
									disabled={loading}
									className="hidden"
								/>
								<Upload className="w-8 h-8 text-warm-gray mb-2" />
								<p className="text-sm text-dark-brown dark:text-dark-text">
									Click to upload PDF
								</p>
								<p className="text-xs text-warm-gray mt-1">
									Max 2MB
								</p>
							</label>
						)}

						{fileError && (
							<p className="text-sm text-red-600 dark:text-red-400">{fileError}</p>
						)}
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm">
							{error}
						</div>
					)}

					<div className="flex gap-4">
						<button type="submit" className="btn-primary cursor-pointer" disabled={loading}>
							{loading ? "Saving..." : "Save Entry"}
						</button>
						<button
							type="button"
							onClick={() => router.back()}
							className="btn-secondary cursor-pointer"
							disabled={loading}
						>
							Cancel
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}
