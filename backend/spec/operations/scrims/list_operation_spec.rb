require 'rails_helper'

RSpec.describe Scrims::ListOperation do
  describe '#call' do
    let(:admin) { create(:user, :admin) }
    let(:manager) { create(:user, :manager) }
    let(:team) { create(:team, manager: manager) }
    let(:other_manager) { create(:user, :manager) }
    let(:other_team) { create(:team, manager: other_manager) }

    let!(:manager_scrim) do
      create(:scrim, :with_lobby_info,
             challenger_team: team,
             time_slot: create(:time_slot, :booked))
    end

    let!(:other_scrim) do
      create(:scrim, :with_lobby_info,
             challenger_team: other_team,
             time_slot: create(:time_slot, :booked, starts_at: 2.days.from_now.change(hour: 19, min: 0)))
    end

    context 'when admin' do
      it 'returns all scrims' do
        result = described_class.call(params: {}, current_user: admin)

        expect(result.size).to eq(2)
      end
    end

    context 'when manager' do
      it 'returns only own scrims' do
        result = described_class.call(params: {}, current_user: manager)

        expect(result.size).to eq(1)
        expect(result.first.id).to eq(manager_scrim.id)
      end
    end

    context 'when filtering by status' do
      let!(:cancelled_scrim) do
        create(:scrim, :cancelled, :with_lobby_info,
               challenger_team: team,
               time_slot: create(:time_slot, :booked, starts_at: 3.days.from_now.change(hour: 19, min: 0)))
      end

      it 'returns only matching scrims' do
        result = described_class.call(params: { status: 'cancelled' }, current_user: manager)

        expect(result.size).to eq(1)
        expect(result.first.id).to eq(cancelled_scrim.id)
      end
    end
  end
end
