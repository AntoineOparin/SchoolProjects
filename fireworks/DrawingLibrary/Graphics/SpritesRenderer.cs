using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace DrawingLibrary.Graphics
{
    public sealed class SpritesRenderer : ISpritesRenderer
    {
        private bool _isDisposed;
        private GraphicsDevice _graphicsDevice;
        private SpriteBatch _sprites;
        private BasicEffect _effect;

        public SpritesRenderer(GraphicsDevice graphicsDevice)
        {
            _graphicsDevice = graphicsDevice ?? throw new ArgumentNullException(nameof(graphicsDevice));


            _isDisposed = false;

            _sprites = new SpriteBatch(_graphicsDevice);

            _effect = new BasicEffect(_graphicsDevice);
            _effect.FogEnabled = false;
            _effect.TextureEnabled = true;
            _effect.LightingEnabled = false;
            _effect.VertexColorEnabled = true;
            _effect.World = Matrix.Identity;
            _effect.Projection = Matrix.Identity;
            _effect.View = Matrix.Identity;
        }

        public void Dispose()
        {
            if (_isDisposed)
            {
                return;
            }

            _effect?.Dispose();
            _sprites?.Dispose();
            _isDisposed = true;
        }

        public void Begin(bool isTextureFilteringEnabled)
        {
            SamplerState sampler = SamplerState.PointClamp;
            if (isTextureFilteringEnabled)
            {
                sampler = SamplerState.LinearClamp;
            }

            Viewport vp = _graphicsDevice.Viewport;
            _effect.Projection = Matrix.CreateOrthographicOffCenter(0, vp.Width, vp.Height,0, 0f, 1f);
            _effect.View = Matrix.Identity;

            _sprites.Begin(blendState: BlendState.AlphaBlend, samplerState: sampler, rasterizerState: RasterizerState.CullNone, effect: _effect);
        }

        public void End()
        {
            _sprites.End();
        }

        public void Draw(Texture2D texture, Rectangle destinationRectangle, Color color)
        {
            _sprites.Draw(texture, destinationRectangle, color);
        }
    }
}
