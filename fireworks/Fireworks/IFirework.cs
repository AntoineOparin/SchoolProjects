
namespace Fireworks
{
    public interface IFirework
    {
        /// <summary>
        /// Indicates if the firework has exploded
        /// </summary>
        bool Exploded { get; }

        /// <summary>
        /// The launched particle before the firework explodes
        /// </summary>
        IParticle Launcher { get; }
        /// <summary>
        /// The particles representing the exploded firework
        /// </summary>
        List<IParticle> Particles { get; }

        /// <summary>
        /// Launches the Firework
        /// </summary>
        void Launch();

        /// <summary>
        /// Updates the fireworks state. 
        /// Once the lifespan of the Launcher reaches zero, the firework explodes.
        /// When exploding the firework creates between 60-100 particles. 
        /// The exploded particles have a new velocity based on IExplosionPattern 
        /// and the velocity of the launcher. When the lifespan of the explosion particles
        /// reaches zero they are removed
        /// </summary>
        void Update();
    }
}