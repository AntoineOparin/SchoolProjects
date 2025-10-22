using ShapeLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fireworks
{
    internal class Particle : IParticle
    {
        public const float Gravity = 0.2f;
        public const float _radius = 2f;
        public Vector Acceleration { get; private set; }

        public Vector Velocity { get; private set; }

        public Vector Position { get; private set; }

        public ICircle Circle { get; private set; }

        public Colour Colour { get; private set; }

        public int Lifespan { get; private set; }

        public bool Done { 
            get
            {
                if (Lifespan <= 0)
                {
                    return true;
                }
                return false;
            }
        }

        public Particle(float x, float y, Colour color, int lifespan)
        {
            if (x < 0 || y < 0)
            {
                throw new ArgumentException("X or Y cannot be less than 0");
            }

            Position = new Vector(x, y);
            Velocity = new Vector(0, 0);
            Acceleration = new Vector(0, 0);
            Colour = color;
            Lifespan = lifespan;
            Circle = ShapesFactory.CreateCircle(x, y, _radius, color);
        }
        public void ApplyGravity()
        {
            Acceleration = new Vector(0, Gravity);
        }

        public void ApplyVelocity(Vector velocity)
        {
            Velocity = Velocity + velocity;
        }

        public void Update()
        {
            // 1. Update velocity using acceleration
            Velocity = Velocity + Acceleration;

            // 2. Update position using velocity
            Position = Position + Velocity;

            // 3. Move the circle shape to follow the new position
            Circle = ShapesFactory.CreateCircle(Position.X, Position.Y, _radius, Colour);

            // 4. Reduce lifespan by 1 per frame.
            Lifespan -= 1;
        }
    }
}
