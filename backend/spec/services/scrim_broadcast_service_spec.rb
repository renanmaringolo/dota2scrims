require 'rails_helper'

RSpec.describe ScrimBroadcastService do
  let(:time_slot) do
    create(:time_slot, :available,
           starts_at: 2.days.from_now.change(hour: 19, min: 0))
  end

  before do
    allow(ActionCable.server).to receive(:broadcast)
  end

  describe '.slot_created' do
    it 'broadcasts slot_created event to scrims channel' do
      described_class.slot_created(time_slot)

      expect(ActionCable.server).to have_received(:broadcast).with(
        'scrims',
        {
          event: 'slot_created',
          data: {
            id: time_slot.id,
            starts_at: time_slot.starts_at.iso8601,
            ends_at: time_slot.ends_at.iso8601,
            status: time_slot.status,
          },
        },
      )
    end
  end

  describe '.slot_booked' do
    before { time_slot.booked! }

    it 'broadcasts slot_booked event to scrims channel' do
      described_class.slot_booked(time_slot)

      expect(ActionCable.server).to have_received(:broadcast).with(
        'scrims',
        {
          event: 'slot_booked',
          data: {
            id: time_slot.id,
            starts_at: time_slot.starts_at.iso8601,
            ends_at: time_slot.ends_at.iso8601,
            status: 'booked',
          },
        },
      )
    end
  end

  describe '.slot_cancelled' do
    it 'broadcasts slot_cancelled event to scrims channel' do
      described_class.slot_cancelled(time_slot)

      expect(ActionCable.server).to have_received(:broadcast).with(
        'scrims',
        {
          event: 'slot_cancelled',
          data: {
            id: time_slot.id,
            starts_at: time_slot.starts_at.iso8601,
            ends_at: time_slot.ends_at.iso8601,
            status: time_slot.status,
          },
        },
      )
    end
  end

  describe 'payload security' do
    let(:team) { create(:team) }
    let(:booked_slot) { create(:time_slot, :booked, starts_at: 3.days.from_now.change(hour: 19, min: 0)) }

    before do
      create(:scrim, :with_lobby_info, challenger_team: team, time_slot: booked_slot)
    end

    it 'does not include challenger team data in payload' do
      described_class.slot_booked(booked_slot)

      expect(ActionCable.server).to have_received(:broadcast) do |_channel, message|
        expect(message[:data]).not_to have_key(:challenger_team)
        expect(message[:data]).not_to have_key(:lobby_name)
        expect(message[:data]).not_to have_key(:lobby_password)
      end
    end
  end
end
