#!/usr/bin/ruby
# Local preview with byte-range support for seeking both songs.
require 'webrick'
require 'net/http'

server = WEBrick::HTTPServer.new(
  Port: 8977,
  BindAddress: '127.0.0.1',
  DocumentRoot: File.expand_path('..', __dir__),
  MimeTypes: WEBrick::HTTPUtils::DefaultMimeTypes.merge('mp3' => 'audio/mpeg'),
  RequestCallback: proc do |request, response|
    # Old WEBrick can return 304 for a requested audio range. Send the range itself.
    request.header.delete('if-modified-since')
    request.header.delete('if-none-match')
    response['Cache-Control'] = 'no-store'
  end
)
# Keep all local pupil checks on the local Worker, including normal code login.
server.mount_proc('/igra-api') do |request, response|
  begin
    path = request.path.sub('/igra-api', '')
    path += '?' + request.query_string if request.query_string
    headers = {}
    ['content-type', 'x-key', 'authorization'].each do |name|
      headers[name] = request[name] if request[name]
    end
    upstream = Net::HTTPGenericRequest.new(request.request_method, !!request.body, true, path, headers)
    upstream.body = request.body if request.body
    result = Net::HTTP.start('127.0.0.1', 8788, open_timeout: 2, read_timeout: 8) { |http| http.request(upstream) }
    response.status = result.code.to_i
    response['Content-Type'] = result['content-type'] || 'application/json'
    response['Cache-Control'] = 'no-store'
    response.body = result.body || ''
  rescue StandardError
    response.status = 503
    response['Content-Type'] = 'application/json'
    response.body = '{"error":"Local preview server is unavailable"}'
  end
end
trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }
puts 'Open http://127.0.0.1:8977/eng5m2a/?test'
server.start
