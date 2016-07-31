defmodule Flooding.Contours do
  defstruct [:contours]

  defmodule Point do
    defstruct [:x, :y]
  end

  defmodule Contour do
    defstruct [:elevation, :points]
  end

  def take n do
    File.stream!("data/contours-christchurch-2011.csv")
    |> CSV.decode(strip_cells: true, num_workers: 8, headers: true, multiline_escape: false)
    |> Enum.take(n)
  end

  def load do
    File.stream!("data/contours-christchurch-2011.csv")
    |> CSV.decode(strip_cells: true, num_workers: 8, headers: true)
    #|> Enum.map(&make_contour/1)
    |> Stream.map(&make_contour/1)
    #|> points
    #|> Enum.map(&Task.async(fn -> make_contour(&1) end))
    #|> Enum.map(&Task.await(&1))
  end

  def point_list contours do
    contours
    |> Enum.reduce([], fn contour, points ->
      Enum.concat(points, contour.points)
    end)
  end

  def points contours do
    contours
    |> Enum.reduce(%{}, fn contour, points ->
      points = contour.points |> Enum.reduce(points, fn point, points ->
        Map.put(points, point, contour.elevation)
      end)
      points |> Map.keys |> Enum.count |> IO.inspect
      points
    end)
  end

  def make_contour row do
    %Contour{
      points: Regex.scan(~r/ ?([\d.]*) ([\d.]*) ([\d.]*)/, Map.get(row, "WKT"), capture: :all_but_first)
        |> Enum.map(&make_point/1),
      elevation: Map.get(row, "ELEVATION") |> Float.parse |> elem(0)
    }
  end

  def make_point [x, y, z] do
    %Point{
      x: x |> Float.parse |> elem(0) |> Float.round,
      y: y |> Float.parse |> elem(0) |> Float.round,
    }
  end

  def make_point _ do
    %Point{}
  end
end
