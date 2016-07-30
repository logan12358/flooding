defmodule Flooding.DataChannel do
  use Phoenix.Channel

  def join("data", _message, socket) do
    {:ok, socket}
  end

  def join(_, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("update", %{"depth" => depth}, socket) do
    broadcast! socket, "update", %{depth: depth}
    {:noreply, socket}
  end
end
