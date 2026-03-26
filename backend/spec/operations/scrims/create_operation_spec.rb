require 'rails_helper'

RSpec.describe Scrims::CreateOperation do
  describe '#call' do
    let(:manager) { create(:user, :manager) }
    let(:team) { create(:team, :with_full_roster, manager: manager) }
    let(:time_slot) { create(:time_slot, :available) }

    let(:valid_params) do
      {
        time_slot_id: time_slot.id,
        team_id: team.id,
        lobby_name: 'AVL-RS-SCRIM',
        lobby_password: 'scrim123',
        server_host: 'br',
      }
    end

    context 'when all validations pass' do
      it 'creates a scrim' do
        expect do
          described_class.call(params: valid_params, current_user: manager)
        end.to change(Scrim, :count).by(1)
      end

      it 'returns the created scrim' do
        scrim = described_class.call(params: valid_params, current_user: manager)

        expect(scrim).to be_a(Scrim)
        expect(scrim.status).to eq('scheduled')
        expect(scrim.lobby_name).to eq('AVL-RS-SCRIM')
        expect(scrim.server_host).to eq('br')
      end

      it 'marks the time slot as booked' do
        described_class.call(params: valid_params, current_user: manager)

        expect(time_slot.reload.status).to eq('booked')
      end
    end

    context 'when team does not belong to current user' do
      let(:other_user) { create(:user, :manager) }

      it 'raises ForbiddenError' do
        expect do
          described_class.call(params: valid_params, current_user: other_user)
        end.to raise_error(Teams::ForbiddenError)
      end
    end

    context 'when team has invalid roster (less than 5 starters)' do
      let(:team_no_roster) { create(:team, manager: manager) }

      it 'raises InvalidRosterError' do
        params = valid_params.merge(team_id: team_no_roster.id)

        expect do
          described_class.call(params: params, current_user: manager)
        end.to raise_error(Scrims::InvalidRosterError)
      end
    end

    context 'when time slot is not available' do
      let(:booked_slot) { create(:time_slot, :booked, starts_at: 2.days.from_now.change(hour: 19, min: 0)) }

      it 'raises SlotNotAvailableError' do
        params = valid_params.merge(time_slot_id: booked_slot.id)

        expect do
          described_class.call(params: params, current_user: manager)
        end.to raise_error(Scrims::SlotNotAvailableError)
      end
    end

    context 'when time slot is cancelled' do
      let(:cancelled_slot) { create(:time_slot, :cancelled, starts_at: 3.days.from_now.change(hour: 19, min: 0)) }

      it 'raises SlotNotAvailableError' do
        params = valid_params.merge(time_slot_id: cancelled_slot.id)

        expect do
          described_class.call(params: params, current_user: manager)
        end.to raise_error(Scrims::SlotNotAvailableError)
      end
    end
  end
end
