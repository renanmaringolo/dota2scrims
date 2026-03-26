require 'rails_helper'

RSpec.describe Scrims::CancelOperation do
  describe '#call' do
    let(:manager) { create(:user, :manager) }
    let(:team) { create(:team, manager: manager) }
    let(:time_slot) { create(:time_slot, :booked) }
    let(:scrim) { create(:scrim, :with_lobby_info, challenger_team: team, time_slot: time_slot) }

    context 'when valid cancellation' do
      it 'cancels the scrim' do
        result = described_class.call(
          params: { id: scrim.id, reason: 'Lero Lero cancelou a partida' },
          current_user: manager,
        )

        expect(result.status).to eq('cancelled')
        expect(result.cancellation_reason).to eq('Lero Lero cancelou a partida')
        expect(result.cancelled_at).to be_present
      end

      it 'releases the time slot' do
        described_class.call(
          params: { id: scrim.id, reason: 'Lero Lero cancelou' },
          current_user: manager,
        )

        expect(time_slot.reload.status).to eq('available')
      end
    end

    context 'when reason is absent' do
      it 'raises ValidationError' do
        expect do
          described_class.call(
            params: { id: scrim.id, reason: '' },
            current_user: manager,
          )
        end.to raise_error(Errors::ValidationError)
      end
    end

    context 'when scrim does not exist' do
      it 'raises NotFoundError' do
        expect do
          described_class.call(
            params: { id: 0, reason: 'Teste' },
            current_user: manager,
          )
        end.to raise_error(Scrims::NotFoundError)
      end
    end

    context 'when user is not the team manager' do
      let(:other_user) { create(:user, :manager) }

      it 'raises ForbiddenError' do
        expect do
          described_class.call(
            params: { id: scrim.id, reason: 'Teste' },
            current_user: other_user,
          )
        end.to raise_error(Scrims::ForbiddenError)
      end
    end

    context 'when scrim is already cancelled' do
      let(:cancelled_scrim) do
        create(:scrim, :cancelled, :with_lobby_info,
               challenger_team: team,
               time_slot: create(:time_slot, :booked, starts_at: 4.days.from_now.change(hour: 19, min: 0)))
      end

      it 'raises ConflictError' do
        expect do
          described_class.call(
            params: { id: cancelled_scrim.id, reason: 'Teste' },
            current_user: manager,
          )
        end.to raise_error(Errors::ConflictError)
      end
    end
  end
end
