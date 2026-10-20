import { motion } from 'framer-motion';
import teacherImage from '../../assets/teacher-stage.jpg';

// Image-only teacher: no WebGL, GLTF, Three.js, bones or 3D model.
// The supplied teacher image is gently animated so the classroom still feels alive.
export default function TeacherAvatar3D({ className = '', speaking = false }) {
  return (
    <motion.img
      src={teacherImage}
      alt="EduReal AI teacher"
      className={className}
      initial={false}
      animate={speaking ? { scale: [1, 1.008, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }}
      transition={speaking ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.25 }}
    />
  );
}
