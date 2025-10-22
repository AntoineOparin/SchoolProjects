using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShapeLibrary
{
    public struct Vector
    {
        public Vector(float x, float y)
        {
            X = x;
            Y = y;
        }

        public Vector(Vector v)
        {
            X = v.X;
            Y = v.Y;
        }

        public float X { get; }
        public float Y { get; }

        public static Vector operator +(Vector a, Vector b)
        {
            return new Vector(a.X + b.X, a.Y + b.Y);
        }

        public static Vector operator -(Vector a, Vector b)
        {
            return new Vector(a.X - b.X, a.Y - b.Y);
        }

        public static Vector operator *(Vector a, float b)
        {
            return new Vector(a.X * b, a.Y * b);
        }

        public static Vector operator *(Vector a, int b)
        {
            return new Vector(a.X * b, a.Y * b);
        }

        public static Vector operator /(Vector a, float b)
        {
            if (b == 0)
            {
                throw new ArgumentException("The denominator cannot be 0");
            }

            return a * (1/b);
        }

        public static double Magnitude(Vector a)
        {
            return Math.Sqrt((a.X * a.X) + (a.Y * a.Y));
        }

        public static Vector Normalize(Vector a)
        {
            if (Magnitude(a) == 0)
            {
                throw new ArgumentException("Cannot divide by zero");
            }

            return new Vector( (float)(a.X / Magnitude(a)), (float)(a.Y / Magnitude(a)) );
        }

        public override string ToString()
        {
            return $"X: {X}, Y: {Y}";
        }
    }
}
