{{/*
Create name to be used with deployment.
*/}}
{{- define "vitalam-identity-service.fullname" -}}
    {{- if .Values.fullnameOverride -}}
        {{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
    {{- else -}}
      {{- $name := default .Chart.Name .Values.nameOverride -}}
      {{- if contains $name .Release.Name -}}
        {{- .Release.Name | trunc 63 | trimSuffix "-" -}}
      {{- else -}}
        {{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
      {{- end -}}
    {{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "vitalam-identity-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "vitalam-identity-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "vitalam-identity-service.fullname" . }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "vitalam-identity-service.labels" -}}
helm.sh/chart: {{ include "vitalam-identity-service.chart" . }}
{{ include "vitalam-identity-service.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Conditionally populate imagePullSecrets if present in the context
*/}}
{{- define "vitalam-identity-service.imagePullSecrets" -}}
  {{- if (not (empty .Values.image.pullSecrets)) }}
imagePullSecrets:
    {{- range .Values.image.pullSecrets }}
  - name: {{ . }}
    {{- end }}
  {{- end }}
{{- end -}}

{{/*
Create a default fully qualified postgresql name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "vitalam-identity-service.postgresql.fullname" -}}
{{- if .Values.config.externalPostgresql -}}
{{ .Values.config.externalPostgresql | trunc 63 | trimSuffix "-" -}}
{{- else if not ( .Values.postgresql.enabled ) -}}
{{ fail "Postgresql must either be enabled or passed via config.externalPostgresql" }}
{{- else if .Values.postgresql.fullnameOverride -}}
{{- .Values.postgresql.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default "postgresql" .Values.postgresql.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Template to define the vitalam-node hostname.
*/}}
{{- define "vitalam-identity-service.node-host" -}}
  {{- if .Values.config.externalNodeHost -}}
    {{- .Values.config.externalNodeHost -}}
  {{- else if .Values.vitalamNode.enabled -}}
    {{- template "vitalam-node.fullname" .Subcharts.vitalamNode -}}
  {{- else }}
    {{- fail "Must supply either externalNodeHost or enable vitalamNode" -}}
  {{- end -}}
{{- end -}}

{{- define "vitalam-identity-service.initDb.name" -}}
{{- if .Values.fullnameOverride -}}
{{- printf "%s-db" .Values.fullnameOverride | lower | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s-db" .Release.Name .Chart.Name | lower | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}