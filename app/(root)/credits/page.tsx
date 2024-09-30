import { CreditForm } from "@/components/shared/CreditsForm";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

const CreditPage = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");
  const user = await getUserById(userId);

  return (
    <div className="m-auto h-[70vh] w-[50vh] rounded-[16px] border-2 border-purple-200/20 bg-white p-5 shadow-lg shadow-purple-200/10 md:px-6 md:py-8">
      <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
      <div className="mt-4 flex items-center gap-4">
        <Image
          src="/assets/icons/coins.svg"
          alt="coins"
          width={50}
          height={50}
          className="size-9 md:size-12"
        />
        <h2 className="h2-bold text-dark-600">{user.creditBalance}</h2>
      </div>

      <CreditForm clerkId={user?.clerkId} />
    </div>
  );
};

export default CreditPage;
