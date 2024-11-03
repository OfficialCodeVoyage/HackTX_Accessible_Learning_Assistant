"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    BookOpen,
    MessageSquare,
    Upload,
    Activity,
    ChevronLeft,
    ChevronRight,
    Layers,
    Settings,
    LogOut,
    HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourse } from "@/context/CourseContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/progress", label: "Progress", icon: Activity },
    { href: "/quiz", label: "Quiz", icon: HelpCircle },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { selectedCourse } = useCourse();

    useEffect(() => {
        if (selectedCourse && pathname !== "/") {
            setIsCollapsed(false);
        }
    }, [selectedCourse, pathname]);

    return (
        <motion.div
            className={cn(
                "bg-gradient-to-b from-purple-700 via-indigo-800 to-blue-900 text-white flex flex-col h-full",
                isCollapsed ? "w-20" : "w-64"
            )}
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <div className="flex items-center justify-between p-4">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            className="flex items-center space-x-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Layers className="h-8 w-8 text-purple-300" />
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300">
                                EduVerse
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-full hover:bg-white/10 transition-colors duration-200"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-purple-300" />
                    ) : (
                        <ChevronLeft className="h-4 w-4 text-purple-300" />
                    )}
                </Button>
            </div>
            {selectedCourse && (
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm">
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-semibold truncate text-purple-200"
                            >
                                {selectedCourse.name}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-2 px-2">
                    {links.map((link) => (
                        <li key={link.href}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "flex items-center p-2 rounded-lg transition-all duration-200",
                                                pathname === link.href
                                                    ? "bg-white/20 text-white"
                                                    : "text-purple-200 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <link.icon
                                                    className={cn(
                                                        "h-5 w-5",
                                                        isCollapsed
                                                            ? "mx-auto"
                                                            : "mr-3"
                                                    )}
                                                />
                                            </motion.div>
                                            {!isCollapsed && (
                                                <span>{link.label}</span>
                                            )}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        sideOffset={20}
                                    >
                                        {link.label}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start text-left text-purple-200 hover:text-white hover:bg-white/10 transition-colors duration-200",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage
                                    src="/avatars/01.png"
                                    alt="@username"
                                />
                                <AvatarFallback>UN</AvatarFallback>
                            </Avatar>
                            {!isCollapsed && <span>User Name</span>}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-56 bg-indigo-900 text-purple-200"
                    >
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="hover:bg-white/10 hover:text-white transition-colors duration-200">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-white/10 hover:text-white transition-colors duration-200">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}
