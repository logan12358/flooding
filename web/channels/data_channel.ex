defmodule Flooding.DataChannel do
  use Phoenix.Channel

  def join("data", _message, socket) do
    {:ok, socket}
  end

  def join(_, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("update", data, socket) do
    IO.puts('Handling data')
    IO.inspect socket
    IO.inspect data
    broadcast! socket, "update", data
    {:noreply, socket}
  end
end
