class ScrimChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'scrims'
  end

  def unsubscribed
    stop_all_streams
  end
end
