'use client'

import { motion } from 'framer-motion'

export default function AntiGravityCard({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
    return (
        <div className="relative group">
            {/* Сама карточка */}
            <motion.div
                // Постоянное мягкое покачивание
                animate={{ y: [0, -12, 0] }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay
                }}
                // Реакция на наведение (резкий взлет)
                whileHover={{
                    y: -25,
                    rotateX: 5,
                    rotateY: -5,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
                {children}
            </motion.div>

            {/* Реалистичная тень под карточкой которая сжимается при взлете */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/40 blur-xl rounded-full 
                scale-x-100 opacity-30 
                group-hover:scale-x-110 group-hover:opacity-50 group-hover:-bottom-10
                transition-all duration-300"
            />
        </div>
    )
}
