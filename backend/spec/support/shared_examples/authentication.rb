RSpec.shared_examples 'an authenticated endpoint' do
  context 'when no token is provided' do
    it 'returns 401 unauthorized' do
      make_request(headers: {})
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context 'when invalid token is provided' do
    it 'returns 401 unauthorized' do
      make_request(headers: { 'Authorization' => 'Bearer invalid_token' })
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
