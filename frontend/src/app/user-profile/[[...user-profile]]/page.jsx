import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
    return (
        <div className="h-[100vh] flex justify-center items-center">
            <UserProfile path="/user-profile" className="w-full max-w-md"/>
        </div>
    )
}