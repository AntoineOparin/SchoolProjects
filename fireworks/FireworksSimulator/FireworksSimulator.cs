using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using DrawingLibrary.Graphics;
using DrawingLibrary.Input;
using System.Collections.Generic;
using ShapeLibrary;
using Fireworks;
using System;

namespace FireworksSimulator;

public class FireworksSimulator : Game
{
    private GraphicsDeviceManager _graphics;
    private CustomKeyboard _customKeyboard;
    private IScreen _screen;
    private ISpritesRenderer _spritesRenderer;
    private IShapesRenderer _shapesRenderer;
    private FireworkEnvironment _fireworkEnvironment;
    private Texture2D _fadeTexture;


    private Random _rng;

    public FireworksSimulator()
    {
        _graphics = new GraphicsDeviceManager(this);
        Content.RootDirectory = "Content";
        IsMouseVisible = true;
        Window.AllowUserResizing = true;
    }

    protected override void Initialize()
    {
        base.Initialize();

        _customKeyboard = CustomKeyboard.Instance;
        _screen = new Screen(new RenderTarget2D(GraphicsDevice, 800, 600, false, SurfaceFormat.Color, DepthFormat.None, 0, RenderTargetUsage.PreserveContents));
        _spritesRenderer = new SpritesRenderer(GraphicsDevice);
        _shapesRenderer = new ShapesRenderer(GraphicsDevice);
        _fireworkEnvironment = new FireworkEnvironment();
        _rng = new Random();
    }

    protected override void LoadContent()
    {
        _fadeTexture = new Texture2D(GraphicsDevice, 1, 1);
        _fadeTexture.SetData(new[] { Color.White });
    }

    protected override void Update(GameTime gameTime)
    {
        _customKeyboard.Update();

        if (GamePad.GetState(PlayerIndex.One).Buttons.Back == ButtonState.Pressed || _customKeyboard.IsKeyDown(Keys.Escape))
            Exit();

        if (_customKeyboard.IsKeyClicked(Keys.Space))
        {
            var f = FireworkFactory.CreateFirework(
                _screen.Width,
                _screen.Height, 
                new Colour(_rng.Next(0, 256), _rng.Next(0, 256), _rng.Next(0, 256)),
                ExplosionPatternFactory.CreateExplosionPattern()
                );

            _fireworkEnvironment.AddFirework( f );
        }

        _fireworkEnvironment.Update();

        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        _screen.Set();
        _shapesRenderer.Begin();
        _spritesRenderer.Begin(false);
        _spritesRenderer.Draw(_fadeTexture, new Rectangle(0, 0, _screen.Width, _screen.Height), Color.Black * 0.1f);

        foreach (var f in _fireworkEnvironment.Fireworks)
        {
            if (!f.Launcher.Done)
            {
                _shapesRenderer.DrawShape(f.Launcher.Circle, 3f);
            }
            
            if (f.Exploded)
            {
                foreach(var p in f.Particles)
                {
                    _shapesRenderer.DrawShape(p.Circle, 3f);
                }
            }
        }

        _spritesRenderer.End();
        _shapesRenderer.End();
        _screen.UnSet();
        _screen.Present(_spritesRenderer);

        base.Draw(gameTime);

    }
}
