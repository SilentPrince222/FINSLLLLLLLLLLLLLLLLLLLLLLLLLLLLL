export default function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {message}
        </div>
    )
}