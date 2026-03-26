require 'rails_helper'

RSpec.describe ScrimChannel, type: :channel do
  describe '#subscribed' do
    it 'streams from scrims' do
      subscribe

      expect(subscription).to be_confirmed
      expect(subscription).to have_stream_from('scrims')
    end
  end

  describe '#unsubscribed' do
    it 'stops all streams' do
      subscribe
      unsubscribe

      expect(subscription).not_to have_streams
    end
  end
end
