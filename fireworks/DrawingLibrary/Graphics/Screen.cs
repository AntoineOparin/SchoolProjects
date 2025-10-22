using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System;

namespace DrawingLibrary.Graphics;

public class Screen : IScreen
{
    private bool _isDisposed;
    private bool _isSet;

    public int Height { get; }

    public int Width { get; }

    private RenderTarget2D _renderTarget;

    public Screen(RenderTarget2D renderTarget2D)
    {
        _isDisposed = false;
        _isSet = false;
        Height = renderTarget2D.Height;
        Width = renderTarget2D.Width;

        _renderTarget = renderTarget2D;
    }

    /// <summary>
    /// Draw sprites to the window. This is performed by using the spritesRenderer to begin drawing, 
    /// drawing with the computed rectangle, and ending the batch
    /// </summary>
    /// <param name="spritesRenderer">The sprites to be drawn</param>
    /// <param name="textureFiltering"></param>
    /// <exception cref="ArgumentNullException">Throws if sprites renderer is null</exception>
    ///
    public void Present(ISpritesRenderer spritesRenderer, bool textureFiltering = true)
    {
        ArgumentNullException.ThrowIfNull(spritesRenderer);

        spritesRenderer.Begin(textureFiltering);

        spritesRenderer.Draw(_renderTarget, CalculateDestinationRectangle(), Color.White);

        spritesRenderer.End();
    }

    /// <summary>
    /// Enables drawing on the render target. This is done by setting the GraphicsDevice render target 
    /// to a render target object
    /// </summary>
    /// <exception cref="Exception">Throws if screen is already set</exception>
    ///
    public void Set()
    {
        if (_isSet)
        {
            throw new Exception("Screen is already set");
        }

        _renderTarget.GraphicsDevice.SetRenderTarget(_renderTarget);
        _isSet = true;
    }

    /// <summary>
    /// Removes drawing on the render target. This is done by setting the GraphicsDevice render target to null
    /// </summary>
    /// <exception cref="Exception">Throws if screen is already unset</exception>
    ///
    public void UnSet()
    {
        if (!_isSet)
        {
            throw new Exception("Screen is already unset");
        }

        _renderTarget.GraphicsDevice.SetRenderTarget(null);
        _isSet = false;
    }

    /// <summary>
    /// Computes the rectangle that fits inside the windows given the screen size. 
    /// Computes the aspect ratio of the window versus the screen and adds a border to either the top or bottom or to the left or right sides
    /// </summary>
    /// <returns>A rectangle whose coordinates and size represent where the screen should be drawn with respect to the window</returns>
    /// <remarks>Note, the coordinate system of the window is (0,0) in the upper left corner with positive X right and positive Y down</remarks>
    public Rectangle CalculateDestinationRectangle()
    {
        int windowWidth = _renderTarget.GraphicsDevice.Viewport.Width;
        int windowHeight = _renderTarget.GraphicsDevice.Viewport.Height;

        float screenAspectRatio = (float)Width / (float)Height;
        float windowAspectRatio = (float)windowWidth / (float)windowHeight;

        // Little comment to clarify, if the windowAspectRatio is smaller
        // than the screenAspectRatio, that means the window is taller but
        // narrower than the screen, then we would calculate accordingly
        // to have black boxes over and under the screen instead of on each side !
        if (windowAspectRatio < screenAspectRatio)
        {
            int sh = (int)(windowWidth / screenAspectRatio);
            int sy = (windowHeight - sh) / 2;
            return new Rectangle(0, sy, windowWidth, sh);
        }
        else
        {
            int sw = (int)(windowHeight * screenAspectRatio);
            int sx = (windowWidth - sw) / 2;
            return new Rectangle(sx, 0, sw, windowHeight);
        }
    }

    public void Dispose()
    {
        if (_isDisposed)
        {
            return;
        }

        _isDisposed = true;
    }
}