namespace ShapeLibrary
{
    public interface ICircle : IShape
    {
        /// <summary>
        /// The radius of the circle
        /// </summary>
        float Radius { get; }
        /// <summary>
        /// The location of the center of the circle
        /// </summary>
        Vector Center { get; }
    }
}
