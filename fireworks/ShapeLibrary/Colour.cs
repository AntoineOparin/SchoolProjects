using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Reflection.Metadata.Ecma335;

namespace ShapeLibrary;

public struct Colour
{
    public Colour(int red, int green, int blue)
    {
        if (!Enumerable.Range(0, 256).Contains(red) || !Enumerable.Range(0, 256).Contains(green) || !Enumerable.Range(0, 256).Contains(blue))
        {
            throw new ArgumentOutOfRangeException("red, green and blue should not be lower than 0 or higher than 255.");
        }

        Red = red;
        Green = green;
        Blue = blue;
    }

    public int Red { get;  }
    public int Green { get; }
    public int Blue { get; }

    public static Colour operator +(Colour a, Colour b)
    {
        int red = (a.Red + b.Red > 255) ? 255 : a.Red + b.Red;
        int green = (a.Green + b.Green > 255) ? 255 : a.Green + b.Green;
        int blue = (a.Blue + b.Blue > 255) ? 255 : a.Blue + b.Blue;

        return new Colour(red, green, blue);
    }

    public static Colour operator -(Colour a, Colour b)
    {
        int red = (a.Red - b.Red < 0) ? 0: a.Red - b.Red;
        int green = (a.Green - b.Green < 0) ? 0: a.Green - b.Green;
        int blue = (a.Blue - b.Blue < 0) ? 0 : a.Blue - b.Blue;

        return new Colour(red, green, blue);
    }

    public static Colour operator *(Colour a, int b)
    {
        if (b < 0)
        {
            throw new ArgumentException("Multiplier cannot be less than 0."); 
        }
        int red = (a.Red * b > 255) ? 255 : a.Red * b;
        int green = (a.Green * b > 255) ? 255 : a.Green * b;
        int blue = (a.Blue * b > 255) ? 255 : a.Blue * b;

        return new Colour(red, green, blue);
    }

    public static bool operator ==(Colour a, Colour b)
    {
        return (a.Red == b.Red) && (a.Green == b.Green) && (a.Blue == b.Blue);
    }

    public static bool operator !=(Colour a, Colour b)
    {
        return !(a == b);
    }

    public override string ToString()
    {
        return $"Red: {Red}, Green: {Green}, Blue: {Blue}";
    }
}
