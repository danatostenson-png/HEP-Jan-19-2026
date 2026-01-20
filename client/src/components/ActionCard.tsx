import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";

interface ActionCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionText: string;
    href: string;
}

export function ActionCard({ title, description, icon: Icon, actionText, href }: ActionCardProps) {
    return (
        <div className="border border-gray-100 rounded-2xl p-8 flex flex-col items-start bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand mb-6">
                <Icon size={24} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed max-w-sm">{description}</p>

            <div className="mt-auto">
                <Link href={href} className="flex items-center gap-2 text-brand font-semibold group-hover:gap-3 transition-all">
                    {actionText}
                    <ArrowRight size={18} />
                </Link>
            </div>

            {/* Decorative circle in bottom right */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-light rounded-full opacity-50 pointer-events-none" />
        </div>
    );
}
