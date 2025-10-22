using ShapeLibrary;

namespace Fireworks
{
    public interface IParticle
    {
        /// <summary>
        /// Acceleration of the particle
        /// </summary>
        Vector Acceleration { get; }
        /// <summary>
        /// Velocity of the Particle
        /// </summary>
        Vector Velocity { get; }
        /// <summary>
        /// Position of the particle
        /// </summary>
        Vector Position { get; }
        
        /// <summary>
        /// The circle representing the particle
        /// </summary>
        ICircle Circle { get; }
        /// <summary>
        /// Colour of the particle
        /// </summary>
        Colour Colour { get; }

        /// <summary>
        /// Returns true of the particle has expired based on its lifespan.
        /// </summary>
        bool Done { get; }

        /// <summary>
        /// Sets the acceleration due to gravity. Note, this should be set to a constant
        /// </summary>
        void ApplyGravity();
        /// <summary>
        /// Adds the velocity to the particle
        /// </summary>
        /// <param name="velocity">The velocity to be added to the particle</param>
        void ApplyVelocity(Vector velocity);

        /// <summary>
        /// Updates the position, velocity, and acceleration of the particle. 
        /// Also updates the position of the circle.
        /// Updates the lifespan by decreasing it by 1
        /// </summary>
        void Update();
    }
}