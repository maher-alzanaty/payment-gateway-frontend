"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import router from "next/router"
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";



export default function AdminLayout({
children
}:{children:React.ReactNode}){

const path = usePathname()

const router = useRouter();

  const handleLogout = async () => {
  try {
    await apiFetch("/admins/logout", {
      method: "POST",
    });

    // Clear local storage if you use it
    localStorage.removeItem("token");
    localStorage.removeItem("admin");

    // Redirect user (example with Next.js router)
    window.location.href = "/";
  } catch (err) {
    console.error("Logout failed:", err);
    alert("Failed to logout. Try again.");
  }
};
const menu = [
{ name:"Orders", href:"/admin-page/orders"},
{ name:"Methods", href:"/admin-page/methods"},
{ name:"Reports", href:"/admin-page/reports"},
{name:"Add Payment", href:"/admin-page/add-payment"},
{name:"Users", href:"/admin-page/users"}

]


return(

<div className="flex min-h-screen bg-gray-100">

<aside className="w-64 bg-gray-200 text-black border-r p-4">

<h1 className="text-xl font-bold mb-6">
Admin Dashboard
</h1>

<nav className="flex flex-col gap-2 ">

{menu.map(m=>(

<Link
key={m.href}
href={m.href}
className={`p-2 rounded ${
path===m.href
? "bg-blue-600 text-white"
: "hover:bg-gray-100"
}`}
>
{m.name}
</Link>

))}
  {/* Logout Button */}
  <button
    onClick={handleLogout}
    className="mt-auto  p-2 rounded flex items-center  text-red-600 hover:bg-red-50 "
  >
    <LogOut size={18} />
    Logout
  </button>

</nav>

</aside>

<main className="flex-1 p-6 bg-blue-50 text-gray-700">
{children}
</main>

</div>

)
}