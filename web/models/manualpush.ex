defmodule Flooding.ManualPush do
  def push depth, predicted do
    Flooding.Endpoint.broadcast "data", "update", %{"depth" => depth, "predicted" => predicted}
  end
end
