using ShapeLibrary;

namespace Fireworks
{
    public interface IExplosionPattern
    {
        int NumberOfParticles { get; }
        Vector ExplosionVelocity { get; }
        Vector LaunchVelocity { get; }
    }
}