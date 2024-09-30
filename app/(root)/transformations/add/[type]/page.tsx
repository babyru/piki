import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const AddTransformationsTypePage = async ({
  params: { type },
}: SearchParamProps) => {
  const transformation = transformationTypes[type];

  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  const user = await getUserById(userId);
  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subtitle} />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationsTypePage;
