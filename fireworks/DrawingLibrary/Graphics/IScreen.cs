
using Microsoft.Xna.Framework;
using System;

namespace DrawingLibrary.Graphics
{
    /// <summary>
    /// Represents a scalable screen that uses a RenderTarget2D in MonoGame. 
    /// Note, the RenderTarget2D is an unmanaged resource that must be disposed
    /// </summary>
    public interface IScreen : IDisposable
    {
        /// <summary>
        /// Height of the screen, based on the render target
        /// </summary>
        int Height { get; }

        /// <summary>
        /// Width of the screen, based on the render target
        /// </summary>
        int Width { get; }

        /// <summary>
        /// Draw sprites to the window. This is performed by using the spritesRenderer to begin drawing, 
        /// drawing with the computed rectangle, and ending the batch
        /// </summary>
        /// <param name="spritesRenderer">The sprites to be drawn</param>
        /// <param name="textureFiltering"></param>
        /// <exception cref="ArgumentNullException">Throws if sprites renderer is null</exception>
        /// 
        void Present(ISpritesRenderer spritesRenderer, bool textureFiltering = true);

        /// <summary>
        /// Enables drawing on the render target. This is done by setting the GraphicsDevice render target 
        /// to a render target object
        /// </summary>
        /// <exception cref="Exception">Throws if screen is already set</exception>
        /// 
        void Set();
        /// <summary>
        /// Removes drawing on the render target. This is done by setting the GraphicsDevice render target to null
        /// </summary>
        /// <exception cref="Exception">Throws if screen is already unset</exception>
        /// 
        void UnSet();

        /// <summary>
        /// Computes the rectangle that fits inside the windows given the screen size. 
        /// Computes the aspect ratio of the window versus the screen and adds a border to either the top or bottom or to the left or right sides
        /// </summary>
        /// <returns>A rectangle whose coordinates and size represent where the screen should be drawn with respect to the window</returns>
        /// <remarks>Note, the coordinate system of the window is (0,0) in the upper left corner with positive X right and positive Y down</remarks>
        Rectangle CalculateDestinationRectangle();
    }
}