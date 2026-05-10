import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export const PageTransition = ({ children }) => {
  return (
    <motion.div animate="animate" exit="exit" initial="initial" variants={variants}>
      {children}
    </motion.div>
  )
}
