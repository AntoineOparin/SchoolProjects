using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System;

namespace DrawingLibrary.Graphics
{
    public interface ISpritesRenderer : IDisposable
    {
        /// <summary>
        /// Start drawing the sprites
        /// </summary>
        /// <param name="isTextureFilteringEnabled"></param>
        void Begin(bool isTextureFilteringEnabled);

        /// <summary>
        /// Draw a given texture or target
        /// </summary>
        /// <param name="texture"></param>
        /// <param name="sourceRectangle"></param>
        /// <param name="destinationRectangle"></param>
        /// <param name="color"></param>
        void Draw(Texture2D texture, Rectangle destinationRectangle, Color color);

        /// <summary>
        /// Ends the drawing
        /// </summary>
        void End();
    }
}