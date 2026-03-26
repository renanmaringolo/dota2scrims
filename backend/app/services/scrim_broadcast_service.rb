class ScrimBroadcastService < BaseService
  CHANNEL = 'scrims'.freeze

  class << self
    def slot_created(time_slot)
      broadcast('slot_created', time_slot)
    end

    def slot_booked(time_slot)
      broadcast('slot_booked', time_slot)
    end

    def slot_cancelled(time_slot)
      broadcast('slot_cancelled', time_slot)
    end

    private

    def broadcast(event, time_slot)
      payload = { event: event, data: serialize(time_slot) }
      ActionCable.server.broadcast(CHANNEL, payload)
      logger.info("[ScrimBroadcastService] Broadcast #{event} for TimeSlot##{time_slot.id}")
    end

    def serialize(time_slot)
      {
        id: time_slot.id,
        starts_at: time_slot.starts_at.iso8601,
        ends_at: time_slot.ends_at.iso8601,
        status: time_slot.status,
      }
    end
  end
end
