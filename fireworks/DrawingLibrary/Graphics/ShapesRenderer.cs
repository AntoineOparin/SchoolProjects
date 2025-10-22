using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using DrawingLibrary;
using ShapeLibrary;


namespace DrawingLibrary.Graphics
{
    public sealed class ShapesRenderer : IShapesRenderer
    {
        public static readonly float MinLineThickness = 0.01f;
        public static readonly float MaxLineThickness = 10f;

        private bool _isDisposed;
        private GraphicsDevice _graphicsDevice;
        private BasicEffect _effect;

        private VertexPositionColor[] _vertices;
        private int[] _indices;

        private int _shapeCount;
        private int _vertexCount;
        private int _indexCount;

        private bool _isStarted;


        public ShapesRenderer(GraphicsDevice graphicsDevice)
        {
            _graphicsDevice = graphicsDevice ?? throw new ArgumentNullException("graphicsDevice");

            _effect = new BasicEffect(_graphicsDevice);
            _effect.TextureEnabled = false;
            _effect.FogEnabled = false;
            _effect.LightingEnabled = false;
            _effect.VertexColorEnabled = true;
            _effect.World = Matrix.Identity;
            _effect.View = Matrix.Identity;
            _effect.Projection = Matrix.Identity;


            const int MaxVertexCount = 1024;
            const int MaxIndexCount = MaxVertexCount * 3;

            _vertices = new VertexPositionColor[MaxVertexCount];
            _indices = new int[MaxIndexCount];

            _shapeCount = 0;
            _vertexCount = 0;
            _indexCount = 0;

            _isStarted = false;


        }
        public void Dispose()
        {
            if (_isDisposed)
            {
                return;
            }

            _effect?.Dispose();
            _isDisposed = true;
        }

        public void Begin()
        {
            if (_isStarted)
            {
                throw new Exception("batching is already started.");
            }


            Viewport vp = _graphicsDevice.Viewport;
            _effect.Projection = Matrix.CreateOrthographicOffCenter(0, vp.Width, vp.Height, 0, 0f, 1f);
            _effect.View = Matrix.Identity;


            _isStarted = true;
        }

        public void End()
        {
            Flush();
            _isStarted = false;
        }

        private void Flush()
        {
            if (_shapeCount == 0)
            {
                return;
            }

            EnsureStarted();

            foreach (EffectPass pass in _effect.CurrentTechnique.Passes)
            {
                pass.Apply();

                _graphicsDevice.DrawUserIndexedPrimitives<VertexPositionColor>(
                    PrimitiveType.TriangleList,
                    _vertices,
                    0,
                    _vertexCount,
                    _indices,
                    0,
                    _indexCount / 3);
            }

            _shapeCount = 0;
            _vertexCount = 0;
            _indexCount = 0;
        }

        private void EnsureStarted()
        {
            if (!_isStarted)
            {
                throw new Exception("batching was never started.");
            }
        }

        private void EnsureSpace(int shapeVertexCount, int shapeIndexCount)
        {
            if (shapeVertexCount > _vertices.Length)
            {
                throw new Exception("Maximum shape vertex count is: " + _vertices.Length);
            }

            if (shapeIndexCount > _indices.Length)
            {
                throw new Exception("Maximum shape index count is: " + _indices.Length);
            }

            if (_vertexCount + shapeVertexCount > _vertices.Length ||
                _indexCount + shapeIndexCount > _indices.Length)
            {
                Flush();
            }
        }
        //Draw shape method that takes an IShape
        public void DrawShape(IShape shape, float thickness = 0.8f)
        {
            DrawUnfilledShapes(shape, thickness);

        }
        private void DrawUnfilledShapes(IShape shape, float thickness = 0.8f)
        {
            int points = shape.Vertices.Count;

            for (int i = 0; i < points; i++)
            {
                if (i < points - 1)
                {
                    this.DrawLine(new Vector2(shape.Vertices[i].X, shape.Vertices[i].Y), new Vector2(shape.Vertices[i + 1].X, shape.Vertices[i + 1].Y), thickness, new Color(shape.Colour.Red, shape.Colour.Green, shape.Colour.Blue));
                }
                else
                {
                    this.DrawLine(new Vector2(shape.Vertices[i].X, shape.Vertices[i].Y), new Vector2(shape.Vertices[0].X, shape.Vertices[0].Y), thickness, new Color(shape.Colour.Red, shape.Colour.Green, shape.Colour.Blue));
                }
            }
        }
        private void DrawLine(Vector2 a, Vector2 b, float thickness, Color color)
        {
            this.DrawLine(a.X, a.Y, b.X, b.Y, thickness, color);
        }
        private void DrawLine(float ax, float ay, float bx, float by, float thickness, Color color)
        {
            this.EnsureStarted();

            const int shapeVertexCount = 4;
            const int shapeIndexCount = 6;

            this.EnsureSpace(shapeVertexCount, shapeIndexCount);

            thickness = Math.Clamp(thickness, ShapesRenderer.MinLineThickness, ShapesRenderer.MaxLineThickness);
            //thickness++; //Not sure why this step is needed after clamping

            float halfThickness = thickness / 2f;

            float e1x = bx - ax;
            float e1y = by - ay;

            Vector2 v = new Vector2(e1x, e1y);

            v = Vector2.Normalize(v);

            e1x = v.X; e1y = v.Y;

            e1x *= halfThickness;
            e1y *= halfThickness;

            float e2x = -e1x;
            float e2y = -e1y;

            float n1x = -e1y;
            float n1y = e1x;

            float n2x = -n1x;
            float n2y = -n1y;

            float q1x = ax + n1x + e2x;
            float q1y = ay + n1y + e2y;

            float q2x = bx + n1x + e1x;
            float q2y = by + n1y + e1y;

            float q3x = bx + n2x + e1x;
            float q3y = by + n2y + e1y;

            float q4x = ax + n2x + e2x;
            float q4y = ay + n2y + e2y;

            _indices[_indexCount++] = 0 + _vertexCount;
            _indices[_indexCount++] = 1 + _vertexCount;
            _indices[_indexCount++] = 2 + _vertexCount;
            _indices[_indexCount++] = 0 + _vertexCount;
            _indices[_indexCount++] = 2 + _vertexCount;
            _indices[_indexCount++] = 3 + _vertexCount;

            _vertices[_vertexCount++] = new VertexPositionColor(new Vector3(q1x, q1y, 0f), color);
            _vertices[_vertexCount++] = new VertexPositionColor(new Vector3(q2x, q2y, 0f), color);
            _vertices[_vertexCount++] = new VertexPositionColor(new Vector3(q3x, q3y, 0f), color);
            _vertices[_vertexCount++] = new VertexPositionColor(new Vector3(q4x, q4y, 0f), color);

            _shapeCount++;
        }

    }
}
