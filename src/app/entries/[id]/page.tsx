"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGetEntry, apiUpdateEntry } from "@/lib/api/entries";
import { apiGetCurrentUser } from "@/lib/api/auth";
import Header from "@/components/Header";

export default function EditEntryPage() {
	const router = useRouter();
	const params = useParams();
	const entryId = params.id as string;
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [createdAt, setCreatedAt] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		async function loadEntry() {
			try {
				const user = await apiGetCurrentUser();
				if (!user) {
					router.push("/login");
					return;
				}

				const entry = await apiGetEntry(entryId);
				setTitle(entry.title);
				setContent(entry.content);
				setCreatedAt(entry.created_at);
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : "Failed to load entry";
				setError(message);
			} finally {
				setLoading(false);
			}
		}

		loadEntry();
	}, [router, entryId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!title.trim() || !content.trim()) {
			setError("Title and content are required");
			return;
		}

		setSaving(true);

		try {

			await apiUpdateEntry(entryId, { title, content });
			router.push("/dashboard");
		} catch (err: unknown) {
			console.error('Update failed:', err);
			const message = err instanceof Error ? err.message : "Failed to update entry";
			setError(message);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen">
				<Header />
				<div className="max-w-3xl mx-auto px-6 py-12">
					<p className="text-warm-gray text-center">Loading...</p>
				</div>
			</div>
		);
	}

	if (error && !title) {
		return (
			<div className="min-h-screen">
				<Header />
				<div className="max-w-3xl mx-auto px-6 py-12">
					<p className="text-red-600 text-center">{error}</p>
					<button
						onClick={() => router.push("/dashboard")}
						className="btn-secondary mt-4 mx-auto block"
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	const displayDate = new Date(createdAt).toLocaleDateString("en-GB", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	return (
		<div className="min-h-screen">
			<Header />

			<main className="max-w-3xl mx-auto px-6 py-12">
				<div className="mb-8">
					<button
						onClick={() => router.back()}
						className="text-warm-gray hover:text-dark-brown  dark:hover:text-beige text-sm mb-4"
					>
						← Back to entries
					</button>
					<h1 className="text-4xl font-serif mb-2 ">
						Edit Entry
					</h1>
					<p className="text-warm-gray text-sm">{displayDate}</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="title"
							className="block text-sm mb-2 font-medium"
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
							disabled={saving}
						/>
					</div>

					<div>
						<label
							htmlFor="content"
							className="block text-sm mb-2 font-medium"
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
							disabled={saving}
						/>
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm">
							{error}
						</div>
					)}

					<div className="flex gap-4">
						<button type="submit" className="btn-primary" disabled={saving}>
							{saving ? "Saving..." : "Update Entry"}
						</button>
						<button
							type="button"
							onClick={() => router.back()}
							className="btn-secondary"
							disabled={saving}
						>
							Cancel
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}
